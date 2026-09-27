package com.vigilanthealth.compass.clinic;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class ClinicRepository {

	private static final String CLINIC_COLUMNS = """
			c.id, c.organization, c.name, c.provider_type, c.address, c.city, c.state, c.postal_code,
			c.eligibility, c.source_url""";

	private static final String PRICE_COLUMNS = """
			p.species, p.category, p.service, p.price, p.price_high, p.procedure_id, p.note, p.price_as_of""";

	private final JdbcClient jdbc;

	public ClinicRepository(JdbcClient jdbc) {
		this.jdbc = jdbc;
	}

	/** Every standard procedure, with how many clinics price it. */
	public List<ProcedureView> procedures() {
		return jdbc.sql("""
				select pr.id, pr.species, pr.category, pr.name, pr.avg_price, pr.avg_basis, pr.us_avg,
				       count(distinct p.clinic_id) as clinic_count
				from procedures pr
				left join clinic_prices p on p.procedure_id = pr.id
				group by pr.id
				order by pr.species, pr.category, pr.name
				""")
			.query((rs, rowNum) -> new ProcedureView(rs.getString("id"), rs.getString("species"),
					rs.getString("category"), rs.getString("name"), rs.getBigDecimal("avg_price"),
					rs.getString("avg_basis"), rs.getBigDecimal("us_avg"), rs.getInt("clinic_count")))
			.list();
	}

	public boolean procedureExists(String procedureId) {
		return jdbc.sql("select count(*) from procedures where id = :id")
			.param("id", procedureId)
			.query(Integer.class)
			.single() > 0;
	}

	/**
	 * Clinics posting a price for {@code procedureId} that overlaps the (inclusive) cost range, near
	 * {@code location}. Clinics are ordered by their cheapest matching price.
	 */
	public List<ClinicView> search(String procedureId, BigDecimal minCost, BigDecimal maxCost,
			LocationFilter location) {
		StringBuilder sql = new StringBuilder("select " + CLINIC_COLUMNS + ", " + PRICE_COLUMNS + """

				from clinic_prices p
				join clinics c on c.id = p.clinic_id
				where p.procedure_id = :procedureId
				""");
		Map<String, Object> params = new HashMap<>();
		params.put("procedureId", procedureId);
		// A posted range ($300–$350) matches when any part of it is within the budget.
		if (minCost != null) {
			sql.append(" and p.price_high >= :minCost");
			params.put("minCost", minCost);
		}
		if (maxCost != null) {
			sql.append(" and p.price <= :maxCost");
			params.put("maxCost", maxCost);
		}
		if (location.postalCode() != null) {
			sql.append(" and c.postal_code = :postalCode");
			params.put("postalCode", location.postalCode());
		}
		if (location.city() != null) {
			sql.append(" and lower(c.city) like lower(:city)");
			params.put("city", escapeLike(location.city()) + "%");
		}
		if (location.state() != null) {
			sql.append(" and upper(c.state) = :state");
			params.put("state", location.state());
		}
		sql.append(" order by p.price, c.name, p.service");

		// Rows arrive cheapest first; group them by clinic, keeping that order.
		Map<UUID, ClinicView> clinics = new LinkedHashMap<>();
		Map<UUID, List<ClinicPrice>> prices = new HashMap<>();
		jdbc.sql(sql.toString()).params(params).query(rs -> {
			UUID id = rs.getObject("id", UUID.class);
			if (!clinics.containsKey(id)) {
				clinics.put(id, clinic(rs));
			}
			prices.computeIfAbsent(id, key -> new ArrayList<>()).add(price(rs));
		});
		return clinics.values().stream().map(clinic -> clinic.withPrices(prices.get(clinic.id()))).toList();
	}

	/** One clinic with every price it posted, grouped by species and category. */
	public Optional<ClinicView> findById(UUID id) {
		return jdbc.sql("select " + CLINIC_COLUMNS + " from clinics c where c.id = :id")
			.param("id", id)
			.query((rs, rowNum) -> clinic(rs))
			.optional()
			.map(clinic -> clinic.withPrices(jdbc.sql("select " + PRICE_COLUMNS + """

					from clinic_prices p
					where p.clinic_id = :id
					order by p.species desc, p.category, p.price, p.service
					""").param("id", id).query((rs, rowNum) -> price(rs)).list()));
	}

	private static ClinicView clinic(ResultSet rs) throws SQLException {
		return new ClinicView(rs.getObject("id", UUID.class), rs.getString("organization"), rs.getString("name"),
				rs.getString("provider_type"), rs.getString("address"), rs.getString("city"), rs.getString("state"),
				rs.getString("postal_code"), rs.getString("eligibility"), rs.getString("source_url"), List.of());
	}

	private static ClinicPrice price(ResultSet rs) throws SQLException {
		Date asOf = rs.getDate("price_as_of");
		return new ClinicPrice(rs.getString("species"), rs.getString("category"), rs.getString("service"),
				rs.getBigDecimal("price"), rs.getBigDecimal("price_high"), rs.getString("procedure_id"),
				rs.getString("note"), asOf == null ? null : asOf.toLocalDate());
	}

	/** Treat % and _ in user input literally. Postgres' default LIKE escape character is backslash. */
	private static String escapeLike(String value) {
		return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
	}

}
