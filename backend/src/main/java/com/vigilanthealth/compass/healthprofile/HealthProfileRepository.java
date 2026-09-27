package com.vigilanthealth.compass.healthprofile;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class HealthProfileRepository {

	private static final String COLUMNS = "age, sex, current_conditions, vaccination_history, family_history, updated_at";

	private final JdbcClient jdbc;

	public HealthProfileRepository(JdbcClient jdbc) {
		this.jdbc = jdbc;
	}

	public Optional<HealthProfileView> find(UUID userId) {
		return jdbc.sql("select " + COLUMNS + " from health_profiles where user_id = :userId")
			.param("userId", userId)
			.query((rs, rowNum) -> view(rs))
			.optional();
	}

	/** Creates or replaces the user's profile. Blank optional fields are stored as null. */
	public HealthProfileView save(UUID userId, HealthProfileInput input) {
		return jdbc.sql("""
				insert into health_profiles (user_id, age, sex, current_conditions, vaccination_history, family_history)
				values (:userId, :age, :sex, :currentConditions, :vaccinationHistory, :familyHistory)
				on conflict (user_id) do update set
				    age = excluded.age,
				    sex = excluded.sex,
				    current_conditions = excluded.current_conditions,
				    vaccination_history = excluded.vaccination_history,
				    family_history = excluded.family_history,
				    updated_at = now()
				returning\s""" + COLUMNS)
			.param("userId", userId)
			.param("age", input.age())
			.param("sex", input.sex().name())
			.param("currentConditions", input.currentConditions().trim())
			.param("vaccinationHistory", blankToNull(input.vaccinationHistory()))
			.param("familyHistory", blankToNull(input.familyHistory()))
			.query((rs, rowNum) -> view(rs))
			.single();
	}

	private static HealthProfileView view(ResultSet rs) throws SQLException {
		return new HealthProfileView(rs.getInt("age"), HealthProfileSex.valueOf(rs.getString("sex")),
				rs.getString("current_conditions"), rs.getString("vaccination_history"),
				rs.getString("family_history"), rs.getObject("updated_at", OffsetDateTime.class));
	}

	private static String blankToNull(String value) {
		return (value == null || value.isBlank()) ? null : value.trim();
	}

}
