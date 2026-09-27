package com.vigilanthealth.compass.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import com.vigilanthealth.compass.TestcontainersConfiguration;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class CommunityControllerTest {

	@Autowired
	private MockMvc mvc;

	@Autowired
	private JdbcClient jdbc;

	private UUID hospitalId;

	/** A test hospital under topic "zz-test", so comments don't mix with the seeded demo hospitals. */
	@BeforeEach
	void insertHospital() {
		jdbc.sql("delete from specialty_hospitals where topic_id = 'zz-test'").update();
		hospitalId = UUID.randomUUID();
		jdbc.sql("""
				insert into specialty_hospitals (id, topic_id, name, specialty, address, city, state)
				values (:id, 'zz-test', 'Test Hospital', 'Testing', '1 Test St', 'Testville', 'ZZ')
				""").param("id", hospitalId).update();
	}

	@Test
	void listsSeededHospitalsForATopic() throws Exception {
		mvc.perform(as(UUID.randomUUID(), get("/api/topics/diabetes/hospitals")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[*].name")
				.value(contains("Fox River Metabolic Health Clinic", "Northwoods Diabetes & Endocrine Center")))
			.andExpect(jsonPath("$[0].topicId").value("diabetes"));

		mvc.perform(as(UUID.randomUUID(), get("/api/topics/no-such-topic/hospitals")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(0));
	}

	@Test
	void getsOneHospital() throws Exception {
		mvc.perform(as(UUID.randomUUID(), get("/api/hospitals/" + hospitalId)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.name").value("Test Hospital"));
		mvc.perform(as(UUID.randomUUID(), get("/api/hospitals/" + UUID.randomUUID())))
			.andExpect(status().isNotFound());
	}

	@Test
	void commentsShowAnonymousNicknameAndRoleNeverTheAuthorsIdentity() throws Exception {
		UUID alice = UUID.randomUUID();
		UUID bob = UUID.randomUUID();

		mvc.perform(as(alice, json(post("/api/hospitals/" + hospitalId + "/comments"), "{\"body\": \"  Walking daily helped me.  \"}")))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.authorName").value(Nicknames.forUser(alice)))
			.andExpect(jsonPath("$.authorRole").value("PATIENT"))
			.andExpect(jsonPath("$.body").value("Walking daily helped me."))
			.andExpect(jsonPath("$.mine").value(true))
			.andExpect(jsonPath("$.authorId").doesNotExist());
		mvc.perform(as(bob, json(post("/api/hospitals/" + hospitalId + "/comments"), "{\"body\": \"Ask about the education class.\"}")))
			.andExpect(status().isCreated());

		mvc.perform(as(bob, get("/api/hospitals/" + hospitalId + "/comments")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[*].body").value(contains("Ask about the education class.", "Walking daily helped me.")))
			.andExpect(jsonPath("$[*].mine").value(contains(true, false)))
			.andExpect(jsonPath("$[1].authorName").value(Nicknames.forUser(alice)))
			.andExpect(jsonPath("$[1].authorId").doesNotExist())
			.andExpect(jsonPath("$[1].email").doesNotExist());
	}

	@Test
	void communityMeReturnsTheSameNicknameUsedOnComments() throws Exception {
		UUID user = UUID.randomUUID();
		mvc.perform(as(user, get("/api/community/me")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.nickname").value(Nicknames.forUser(user)))
			.andExpect(jsonPath("$.role").value("PATIENT"));
	}

	@Test
	void rejectsBlankOrTooLongCommentsAndUnknownHospitals() throws Exception {
		String url = "/api/hospitals/" + hospitalId + "/comments";
		mvc.perform(as(UUID.randomUUID(), json(post(url), "{\"body\": \"   \"}"))).andExpect(status().isBadRequest());
		mvc.perform(as(UUID.randomUUID(), json(post(url), "{\"body\": \"" + "x".repeat(2001) + "\"}")))
			.andExpect(status().isBadRequest());
		mvc.perform(as(UUID.randomUUID(), json(post("/api/hospitals/" + UUID.randomUUID() + "/comments"), "{\"body\": \"hi\"}")))
			.andExpect(status().isNotFound());
		mvc.perform(as(UUID.randomUUID(), get("/api/hospitals/" + UUID.randomUUID() + "/comments")))
			.andExpect(status().isNotFound());
	}

	@Test
	void requiresAuthentication() throws Exception {
		mvc.perform(get("/api/topics/diabetes/hospitals")).andExpect(status().isUnauthorized());
		mvc.perform(get("/api/hospitals/" + hospitalId + "/comments")).andExpect(status().isUnauthorized());
		mvc.perform(json(post("/api/hospitals/" + hospitalId + "/comments"), "{\"body\": \"hi\"}"))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void nicknamesAreStablePerUser() {
		UUID user = UUID.randomUUID();
		assertThat(Nicknames.forUser(user)).isEqualTo(Nicknames.forUser(user)).matches("[A-Z][a-z]+ [A-Z][a-z]+");
	}

	private static MockHttpServletRequestBuilder as(UUID userId, MockHttpServletRequestBuilder request) {
		RequestPostProcessor user = jwt().jwt(token -> token.subject(userId.toString()).claim("email", "someone@example.com"));
		return request.with(user);
	}

	private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, String body) {
		return request.contentType(MediaType.APPLICATION_JSON).content(body);
	}

}
