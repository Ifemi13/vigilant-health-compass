package com.vigilanthealth.compass.community;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class CommunityRepository {

	private static final int MAX_COMMENTS = 200;

	private static final String HOSPITAL_COLUMNS = """
			id, topic_id, name, specialty, address, city, state, postal_code, phone, website, description""";

	private final JdbcClient jdbc;

	public CommunityRepository(JdbcClient jdbc) {
		this.jdbc = jdbc;
	}

	public List<HospitalView> hospitalsForTopic(String topicId) {
		return jdbc.sql("select " + HOSPITAL_COLUMNS + " from specialty_hospitals where topic_id = :topicId order by name")
			.param("topicId", topicId)
			.query((rs, rowNum) -> hospital(rs))
			.list();
	}

	public Optional<HospitalView> findHospital(UUID id) {
		return jdbc.sql("select " + HOSPITAL_COLUMNS + " from specialty_hospitals where id = :id")
			.param("id", id)
			.query((rs, rowNum) -> hospital(rs))
			.optional();
	}

	/** Newest first. {@code viewerId} only decides {@link CommentView#mine()}; author ids never leave here. */
	public List<CommentView> comments(UUID hospitalId, UUID viewerId) {
		return jdbc.sql("""
				select id, author_id, author_name, author_role, body, created_at
				from hospital_comments
				where hospital_id = :hospitalId
				order by created_at desc, id
				limit :limit
				""")
			.param("hospitalId", hospitalId)
			.param("limit", MAX_COMMENTS)
			.query((rs, rowNum) -> comment(rs, viewerId))
			.list();
	}

	public CommentView addComment(UUID hospitalId, UUID authorId, String authorName, AuthorRole role, String body) {
		return jdbc.sql("""
				insert into hospital_comments (hospital_id, author_id, author_name, author_role, body)
				values (:hospitalId, :authorId, :authorName, :role, :body)
				returning id, author_id, author_name, author_role, body, created_at
				""")
			.param("hospitalId", hospitalId)
			.param("authorId", authorId)
			.param("authorName", authorName)
			.param("role", role.name())
			.param("body", body)
			.query((rs, rowNum) -> comment(rs, authorId))
			.single();
	}

	private static HospitalView hospital(ResultSet rs) throws SQLException {
		return new HospitalView(rs.getObject("id", UUID.class), rs.getString("topic_id"), rs.getString("name"),
				rs.getString("specialty"), rs.getString("address"), rs.getString("city"), rs.getString("state"),
				rs.getString("postal_code"), rs.getString("phone"), rs.getString("website"),
				rs.getString("description"));
	}

	private static CommentView comment(ResultSet rs, UUID viewerId) throws SQLException {
		return new CommentView(rs.getObject("id", UUID.class), rs.getString("author_name"),
				AuthorRole.valueOf(rs.getString("author_role")), rs.getString("body"),
				rs.getObject("created_at", OffsetDateTime.class), rs.getObject("author_id", UUID.class).equals(viewerId));
	}

}
