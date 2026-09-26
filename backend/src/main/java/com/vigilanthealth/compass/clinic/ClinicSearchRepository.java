package com.vigilanthealth.compass.clinic;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class ClinicSearchRepository {

	private static final int MAX_RESULTS = 50;

	private final JdbcClient jdbc;

	public ClinicSearchRepository(JdbcClient jdbc) {
		this.jdbc = jdbc;
	}

	/**
	 * Clinics offering {@code service} within the (inclusive) cost range and location, cheapest first.
	 */
	public List<ClinicResult> search(ServiceType service, BigDecimal minCost, BigDecimal maxCost,
			LocationFilter location) {
		StringBuilder sql = new StringBuilder("""
				select c.id, c.name, c.address_line, c.city, c.state, c.postal_code, c.phone, c.email, c.website,
				       s.price
				from clinics c
				join clinic_services s on s.clinic_id = c.id and s.service = :service
				where true
				""");
		Map<String, Object> params = new HashMap<>();
		params.put("service", service.name());
		if (minCost != null) {
			sql.append(" and s.price >= :minCost");
			params.put("minCost", minCost);
		}
		if (maxCost != null) {
			sql.append(" and s.price <= :maxCost");
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
		sql.append(" order by s.price, c.name limit ").append(MAX_RESULTS);

		List<ClinicResult> clinics = jdbc.sql(sql.toString())
			.params(params)
			.query((rs, rowNum) -> new ClinicResult(rs.getObject("id", UUID.class), rs.getString("name"),
					rs.getString("address_line"), rs.getString("city"), rs.getString("state"),
					rs.getString("postal_code"), rs.getString("phone"), rs.getString("email"),
					rs.getString("website"), rs.getBigDecimal("price"), List.of()))
			.list();
		if (clinics.isEmpty()) {
			return clinics;
		}

		Map<UUID, List<ServicePrice>> servicesByClinic = servicesFor(clinics.stream().map(ClinicResult::id).toList());
		return clinics.stream()
			.map(clinic -> clinic.withServices(servicesByClinic.getOrDefault(clinic.id(), List.of())))
			.toList();
	}

	public Optional<ClinicDetail> findById(UUID id) {
		return jdbc.sql("""
				select id, name, address_line, city, state, postal_code, phone, email, website
				from clinics
				where id = :id
				""")
			.param("id", id)
			.query((rs, rowNum) -> new ClinicDetail(rs.getObject("id", UUID.class), rs.getString("name"),
					rs.getString("address_line"), rs.getString("city"), rs.getString("state"),
					rs.getString("postal_code"), rs.getString("phone"), rs.getString("email"),
					rs.getString("website"), List.of()))
			.optional()
			.map(clinic -> clinic.withServices(servicesFor(List.of(id)).getOrDefault(id, List.of())));
	}

	/** Every service (with price) offered by each of the given clinics, in {@link ServiceType} order. */
	private Map<UUID, List<ServicePrice>> servicesFor(List<UUID> clinicIds) {
		Map<UUID, List<ServicePrice>> servicesByClinic = new HashMap<>();
		jdbc.sql("select clinic_id, service, price from clinic_services where clinic_id in (:ids)")
			.param("ids", clinicIds)
			.query(rs -> {
				servicesByClinic.computeIfAbsent(rs.getObject("clinic_id", UUID.class), id -> new ArrayList<>())
					.add(new ServicePrice(ServiceType.valueOf(rs.getString("service")), rs.getBigDecimal("price")));
			});
		servicesByClinic.values().forEach(services -> services.sort(Comparator.comparing(ServicePrice::service)));
		return servicesByClinic;
	}

	/** Treat % and _ in user input literally. Postgres' default LIKE escape character is backslash. */
	private static String escapeLike(String value) {
		return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
	}

}
