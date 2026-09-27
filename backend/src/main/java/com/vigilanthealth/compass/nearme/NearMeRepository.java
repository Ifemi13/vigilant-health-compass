package com.vigilanthealth.compass.nearme;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.vigilanthealth.compass.nearme.NearMeResponse.Origin;

@Repository
public class NearMeRepository {

	private static final int MAX_RESULTS = 100;

	/** Great-circle distance in miles from (:lat, :lng) to the row's latitude / longitude. */
	private static final String DISTANCE_MILES = """
			3958.8 * 2 * asin(sqrt(
			    power(sin(radians(latitude - :lat) / 2), 2)
			    + cos(radians(:lat)) * cos(radians(latitude)) * power(sin(radians(longitude - :lng) / 2), 2)))""";

	private static final String PLACES = """
			select 'HOSPITAL' as kind, id, name, hospital_type as category, null::text as organization, address, city,
			       state, postal_code, phone, null::text as website, latitude, longitude, location_approximate,
			       star_rating, emergency_services
			from hospitals
			where latitude is not null
			union all
			select 'CLINIC', id, name, health_center_type, organization, address, city, state, postal_code, phone,
			       website, latitude, longitude, false, null::smallint, null::boolean
			from community_health_centers""";

	private final JdbcClient jdbc;

	public NearMeRepository(JdbcClient jdbc) {
		this.jdbc = jdbc;
	}

	public Optional<Origin> zipCenter(String zip) {
		return jdbc.sql("select zip, latitude, longitude from zip_centers where zip = :zip")
			.param("zip", zip)
			.query((rs, rowNum) -> new Origin(rs.getString("zip"), rs.getDouble("latitude"), rs.getDouble("longitude")))
			.optional();
	}

	/** A Wisconsin city / village / CDP by name (case-insensitive), preferring incorporated places. */
	public Optional<Origin> placeCenter(String name) {
		return jdbc.sql("""
				select name, state, latitude, longitude from place_centers
				where lower(name) = lower(:name)
				order by (kind = 'CDP'), id
				limit 1
				""")
			.param("name", name)
			.query((rs, rowNum) -> new Origin(rs.getString("name") + ", " + rs.getString("state"),
					rs.getDouble("latitude"), rs.getDouble("longitude")))
			.optional();
	}

	/** Places within {@code radiusMiles} of the origin, nearest first; {@code kind} null means both kinds. */
	public List<NearbyPlace> search(double lat, double lng, int radiusMiles, CareKind kind) {
		StringBuilder sql = new StringBuilder("select * from (select places.*, " + DISTANCE_MILES
				+ " as distance_miles from (" + PLACES + ") places) nearby where distance_miles <= :radius");
		Map<String, Object> params = new HashMap<>();
		params.put("lat", lat);
		params.put("lng", lng);
		params.put("radius", radiusMiles);
		if (kind != null) {
			sql.append(" and kind = :kind");
			params.put("kind", kind.name());
		}
		sql.append(" order by distance_miles, name limit ").append(MAX_RESULTS);
		return jdbc.sql(sql.toString())
			.params(params)
			.query((rs, rowNum) -> new NearbyPlace(CareKind.valueOf(rs.getString("kind")), rs.getObject("id", UUID.class),
					rs.getString("name"), rs.getString("category"), rs.getString("organization"), rs.getString("address"),
					rs.getString("city"), rs.getString("state"), rs.getString("postal_code"), rs.getString("phone"),
					rs.getString("website"), Math.round(rs.getDouble("distance_miles") * 10) / 10.0,
					rs.getBoolean("location_approximate"), rs.getObject("star_rating", Integer.class),
					rs.getObject("emergency_services", Boolean.class)))
			.list();
	}

}
