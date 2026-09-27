package com.vigilanthealth.compass.community;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.vigilanthealth.compass.clinic.LocationFilter;
import com.vigilanthealth.compass.healthprofile.HealthProfileSex;

@Repository
public class CommunityRepository {

	private static final int MAX_COMMENTS = 200;

	private static final String HOSPITAL_COLUMNS = """
			id, name, address, city, state, postal_code, county, phone, hospital_type, ownership,
			emergency_services, star_rating""";

	/** Comments joined with the author's Health Profile, for the age and sex shown next to their nickname. */
	private static final String COMMENT_SELECT = """
			select c.id, c.author_id, c.author_name, c.author_role, c.body, c.created_at, c.edited_at,
			       hp.age as author_age, hp.sex as author_sex
			from hospital_comments c
			left join health_profiles hp on hp.user_id = c.author_id
			""";

	private final JdbcClient jdbc;

	public CommunityRepository(JdbcClient jdbc) {
		this.jdbc = jdbc;
	}

	/** Hospitals near {@code location}, highest CMS star rating first (unrated last). */
	public List<HospitalView> hospitals(LocationFilter location, boolean psychiatricFirst) {
		StringBuilder sql = new StringBuilder("select " + HOSPITAL_COLUMNS + " from hospitals where true");
		Map<String, Object> params = new HashMap<>();
		if (location.postalCode() != null) {
			sql.append(" and postal_code = :postalCode");
			params.put("postalCode", location.postalCode());
		}
		if (location.city() != null) {
			sql.append(" and lower(city) like lower(:city)");
			params.put("city", escapeLike(location.city()) + "%");
		}
		if (location.state() != null) {
			sql.append(" and upper(state) = :state");
			params.put("state", location.state());
		}
		sql.append(" order by ");
		if (psychiatricFirst) {
			sql.append("(hospital_type = 'Psychiatric') desc, ");
		}
		sql.append("star_rating desc nulls last, name");
		return jdbc.sql(sql.toString()).params(params).query((rs, rowNum) -> hospital(rs)).list();
	}

	public Optional<HospitalView> findHospital(UUID id) {
		return jdbc.sql("select " + HOSPITAL_COLUMNS + " from hospitals where id = :id")
			.param("id", id)
			.query((rs, rowNum) -> hospital(rs))
			.optional();
	}

	/** A hospital's forum for one topic, newest first. {@code viewerId} only decides {@link CommentView#mine()}. */
	public List<CommentView> comments(UUID hospitalId, String topicId, UUID viewerId) {
		return jdbc.sql(COMMENT_SELECT + """
				where c.hospital_id = :hospitalId and c.topic_id = :topicId
				order by c.created_at desc, c.id
				limit :limit
				""")
			.param("hospitalId", hospitalId)
			.param("topicId", topicId)
			.param("limit", MAX_COMMENTS)
			.query((rs, rowNum) -> comment(rs, viewerId))
			.list();
	}

	public CommentView addComment(UUID hospitalId, String topicId, UUID authorId, String authorName, AuthorRole role,
			String body) {
		UUID id = jdbc.sql("""
				insert into hospital_comments (hospital_id, topic_id, author_id, author_name, author_role, body)
				values (:hospitalId, :topicId, :authorId, :authorName, :role, :body)
				returning id
				""")
			.param("hospitalId", hospitalId)
			.param("topicId", topicId)
			.param("authorId", authorId)
			.param("authorName", authorName)
			.param("role", role.name())
			.param("body", body)
			.query(UUID.class)
			.single();
		return findComment(id, authorId);
	}

	/** The author of a comment in this hospital's forum for this topic, or empty if there's no such comment. */
	public Optional<UUID> commentAuthor(UUID hospitalId, String topicId, UUID commentId) {
		return jdbc.sql("""
				select author_id from hospital_comments
				where id = :id and hospital_id = :hospitalId and topic_id = :topicId
				""")
			.param("id", commentId)
			.param("hospitalId", hospitalId)
			.param("topicId", topicId)
			.query(UUID.class)
			.optional();
	}

	public CommentView editComment(UUID commentId, UUID viewerId, String body) {
		jdbc.sql("update hospital_comments set body = :body, edited_at = now() where id = :id")
			.param("id", commentId)
			.param("body", body)
			.update();
		return findComment(commentId, viewerId);
	}

	private CommentView findComment(UUID commentId, UUID viewerId) {
		return jdbc.sql(COMMENT_SELECT + " where c.id = :id")
			.param("id", commentId)
			.query((rs, rowNum) -> comment(rs, viewerId))
			.single();
	}

	public void deleteComment(UUID commentId) {
		jdbc.sql("delete from hospital_comments where id = :id").param("id", commentId).update();
	}

	private static HospitalView hospital(ResultSet rs) throws SQLException {
		return new HospitalView(rs.getObject("id", UUID.class), rs.getString("name"), rs.getString("address"),
				rs.getString("city"), rs.getString("state"), rs.getString("postal_code"), rs.getString("county"),
				rs.getString("phone"), rs.getString("hospital_type"), rs.getString("ownership"),
				rs.getBoolean("emergency_services"), rs.getObject("star_rating", Integer.class));
	}

	private static CommentView comment(ResultSet rs, UUID viewerId) throws SQLException {
		String sex = rs.getString("author_sex");
		return new CommentView(rs.getObject("id", UUID.class), rs.getString("author_name"),
				AuthorRole.valueOf(rs.getString("author_role")), rs.getObject("author_age", Integer.class),
				sex == null ? null : HealthProfileSex.valueOf(sex), rs.getString("body"),
				rs.getObject("created_at", OffsetDateTime.class), rs.getObject("edited_at", OffsetDateTime.class),
				rs.getObject("author_id", UUID.class).equals(viewerId));
	}

	/** Treat % and _ in user input literally. Postgres' default LIKE escape character is backslash. */
	private static String escapeLike(String value) {
		return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
	}

}
