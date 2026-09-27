package com.vigilanthealth.compass.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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

import com.jayway.jsonpath.JsonPath;
import com.vigilanthealth.compass.TestcontainersConfiguration;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class CommunityControllerTest {

	private static final String TOPIC = "diabetes";

	@Autowired
	private MockMvc mvc;

	@Autowired
	private JdbcClient jdbc;

	private UUID hospitalId;

	/**
	 * Test hospitals live in state "ZZ" (city "Testville"), keeping them and their comments apart from the real
	 * CMS Wisconsin hospitals loaded by V11.
	 */
	@BeforeEach
	void insertHospitals() {
		jdbc.sql("delete from hospitals where state = 'ZZ'").update();
		hospitalId = hospital("Alpha General", "99901", "Acute Care Hospitals", 3);
		hospital("Bravo Medical Center", "99902", "Acute Care Hospitals", 5);
		hospital("Charlie Critical Access", "99901", "Critical Access Hospitals", null);
		hospital("Delta Behavioral Health", "99903", "Psychiatric", 2);
	}

	@Test
	void realCmsWisconsinHospitalsAreLoaded() throws Exception {
		assertThat(jdbc.sql("select count(*) from hospitals where state = 'WI'").query(Integer.class).single())
			.isEqualTo(140);
		mvc.perform(as(UUID.randomUUID(), get("/api/topics/diabetes/hospitals?location=Stevens Point")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[*].name").value(hasItem("Aspirus Stevens Point Hospital & Clinics, Inc.")))
			.andExpect(jsonPath("$[0].state").value("WI"));
	}

	@Test
	void listsHospitalsByStarRatingWithUnratedLast() throws Exception {
		mvc.perform(as(UUID.randomUUID(), get("/api/topics/diabetes/hospitals?location=Testville")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[*].name").value(
					contains("Bravo Medical Center", "Alpha General", "Delta Behavioral Health", "Charlie Critical Access")))
			.andExpect(jsonPath("$[0].starRating").value(5))
			.andExpect(jsonPath("$[3].starRating").doesNotExist());
	}

	@Test
	void mentalWellnessListsPsychiatricHospitalsFirst() throws Exception {
		mvc.perform(as(UUID.randomUUID(), get("/api/topics/mental-wellness/hospitals?location=Testville")))
			.andExpect(jsonPath("$[0].name").value("Delta Behavioral Health"))
			.andExpect(jsonPath("$[0].hospitalType").value("Psychiatric"));
	}

	@Test
	void filtersByZipAndCity() throws Exception {
		mvc.perform(as(UUID.randomUUID(), get("/api/topics/diabetes/hospitals?location=99901")))
			.andExpect(jsonPath("$[*].name").value(contains("Alpha General", "Charlie Critical Access")));
		mvc.perform(as(UUID.randomUUID(), get("/api/topics/diabetes/hospitals?location=testvil, zz")))
			.andExpect(jsonPath("$.length()").value(4));
	}

	@Test
	void unknownTopicOrHospitalIs404() throws Exception {
		mvc.perform(as(UUID.randomUUID(), get("/api/topics/no-such-topic/hospitals"))).andExpect(status().isNotFound());
		mvc.perform(as(UUID.randomUUID(), get("/api/topics/no-such-topic/hospitals/" + hospitalId + "/comments")))
			.andExpect(status().isNotFound());
		mvc.perform(as(UUID.randomUUID(), get("/api/hospitals/" + UUID.randomUUID()))).andExpect(status().isNotFound());
		mvc.perform(as(UUID.randomUUID(), get("/api/topics/diabetes/hospitals/" + UUID.randomUUID() + "/comments")))
			.andExpect(status().isNotFound());
		mvc.perform(as(UUID.randomUUID(), get("/api/hospitals/" + hospitalId)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.name").value("Alpha General"))
			.andExpect(jsonPath("$.emergencyServices").value(true));
	}

	@Test
	void commentsShowAnonymousNicknameAndRoleNeverTheAuthorsIdentity() throws Exception {
		UUID alice = UUID.randomUUID();
		UUID bob = UUID.randomUUID();

		mvc.perform(as(alice, json(post(commentsUrl(TOPIC)), "{\"body\": \"  Walking daily helped me.  \"}")))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.authorName").value(Nicknames.forUser(alice)))
			.andExpect(jsonPath("$.authorRole").value("PATIENT"))
			.andExpect(jsonPath("$.body").value("Walking daily helped me."))
			.andExpect(jsonPath("$.mine").value(true))
			.andExpect(jsonPath("$.editedAt").doesNotExist())
			.andExpect(jsonPath("$.authorId").doesNotExist());
		postComment(bob, TOPIC, "Ask about the education class.");

		mvc.perform(as(bob, get(commentsUrl(TOPIC))))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[*].body").value(contains("Ask about the education class.", "Walking daily helped me.")))
			.andExpect(jsonPath("$[*].mine").value(contains(true, false)))
			.andExpect(jsonPath("$[1].authorName").value(Nicknames.forUser(alice)))
			.andExpect(jsonPath("$[1].authorId").doesNotExist())
			.andExpect(jsonPath("$[1].email").doesNotExist());
	}

	@Test
	void eachTopicHasItsOwnForumPerHospital() throws Exception {
		UUID alice = UUID.randomUUID();
		String diabetesComment = postComment(alice, "diabetes", "About diabetes");
		postComment(alice, "cancer-awareness", "About cancer");

		mvc.perform(as(alice, get(commentsUrl("diabetes")))).andExpect(jsonPath("$[*].body").value(contains("About diabetes")));
		mvc.perform(as(alice, get(commentsUrl("cancer-awareness"))))
			.andExpect(jsonPath("$[*].body").value(contains("About cancer")));
		// A comment can only be changed through the forum it belongs to.
		mvc.perform(as(alice, delete(commentsUrl("cancer-awareness") + "/" + diabetesComment)))
			.andExpect(status().isNotFound());
	}

	@Test
	void postsShowAgeAndSexFromTheAuthorsHealthProfile() throws Exception {
		UUID alice = UUID.randomUUID();
		String commentId = postComment(alice, TOPIC, "Before my profile");
		mvc.perform(as(alice, get(commentsUrl(TOPIC))))
			.andExpect(jsonPath("$[0].authorAge").doesNotExist())
			.andExpect(jsonPath("$[0].authorSex").doesNotExist());

		mvc.perform(as(alice, json(put("/api/health-profile"),
				"{\"age\": 58, \"sex\": \"FEMALE\", \"currentConditions\": \"Type 2 diabetes\"}")))
			.andExpect(status().isOk());

		// Shown on existing and new posts, and to other readers.
		mvc.perform(as(UUID.randomUUID(), get(commentsUrl(TOPIC))))
			.andExpect(jsonPath("$[0].authorAge").value(58))
			.andExpect(jsonPath("$[0].authorSex").value("FEMALE"))
			.andExpect(jsonPath("$[0].currentConditions").doesNotExist());
		mvc.perform(as(alice, json(put(commentsUrl(TOPIC) + "/" + commentId), "{\"body\": \"Edited\"}")))
			.andExpect(jsonPath("$.authorAge").value(58));
		mvc.perform(as(alice, json(post(commentsUrl(TOPIC)), "{\"body\": \"After my profile\"}")))
			.andExpect(jsonPath("$.authorSex").value("FEMALE"));
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
	void rejectsBlankOrTooLongComments() throws Exception {
		mvc.perform(as(UUID.randomUUID(), json(post(commentsUrl(TOPIC)), "{\"body\": \"   \"}")))
			.andExpect(status().isBadRequest());
		mvc.perform(as(UUID.randomUUID(), json(post(commentsUrl(TOPIC)), "{\"body\": \"" + "x".repeat(2001) + "\"}")))
			.andExpect(status().isBadRequest());
	}

	@Test
	void authorCanEditAndDeleteTheirPost() throws Exception {
		UUID alice = UUID.randomUUID();
		String commentUrl = commentsUrl(TOPIC) + "/" + postComment(alice, TOPIC, "First draft");

		mvc.perform(as(alice, json(put(commentUrl), "{\"body\": \"  Better wording  \"}")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.body").value("Better wording"))
			.andExpect(jsonPath("$.editedAt").exists())
			.andExpect(jsonPath("$.mine").value(true));
		mvc.perform(as(alice, get(commentsUrl(TOPIC))))
			.andExpect(jsonPath("$[0].body").value("Better wording"))
			.andExpect(jsonPath("$[0].editedAt").exists());

		mvc.perform(as(alice, delete(commentUrl))).andExpect(status().isNoContent());
		mvc.perform(as(alice, get(commentsUrl(TOPIC)))).andExpect(jsonPath("$.length()").value(0));
		mvc.perform(as(alice, delete(commentUrl))).andExpect(status().isNotFound());
	}

	@Test
	void othersCannotEditOrDeleteAPost() throws Exception {
		UUID alice = UUID.randomUUID();
		UUID bob = UUID.randomUUID();
		String commentUrl = commentsUrl(TOPIC) + "/" + postComment(alice, TOPIC, "Alice's tip");

		mvc.perform(as(bob, json(put(commentUrl), "{\"body\": \"hijacked\"}"))).andExpect(status().isForbidden());
		mvc.perform(as(bob, delete(commentUrl))).andExpect(status().isForbidden());
		mvc.perform(as(bob, get(commentsUrl(TOPIC))))
			.andExpect(jsonPath("$[0].body").value("Alice's tip"))
			.andExpect(jsonPath("$[0].editedAt").doesNotExist());
		mvc.perform(as(alice, json(put(commentUrl), "{\"body\": \" \"}"))).andExpect(status().isBadRequest());
	}

	@Test
	void requiresAuthentication() throws Exception {
		mvc.perform(get("/api/topics/diabetes/hospitals")).andExpect(status().isUnauthorized());
		mvc.perform(get(commentsUrl(TOPIC))).andExpect(status().isUnauthorized());
		mvc.perform(json(post(commentsUrl(TOPIC)), "{\"body\": \"hi\"}")).andExpect(status().isUnauthorized());
	}

	@Test
	void nicknamesAreStablePerUser() {
		UUID user = UUID.randomUUID();
		assertThat(Nicknames.forUser(user)).isEqualTo(Nicknames.forUser(user)).matches("[A-Z][a-z]+ [A-Z][a-z]+");
	}

	private String commentsUrl(String topicId) {
		return "/api/topics/" + topicId + "/hospitals/" + hospitalId + "/comments";
	}

	/** Posts a comment as {@code author} and returns its id. */
	private String postComment(UUID author, String topicId, String body) throws Exception {
		String response = mvc.perform(as(author, json(post(commentsUrl(topicId)), "{\"body\": \"" + body + "\"}")))
			.andExpect(status().isCreated())
			.andReturn()
			.getResponse()
			.getContentAsString();
		return JsonPath.read(response, "$.id");
	}

	private UUID hospital(String name, String postalCode, String type, Integer starRating) {
		UUID id = UUID.randomUUID();
		jdbc.sql("""
				insert into hospitals (id, cms_facility_id, name, address, city, state, postal_code, hospital_type,
				                       emergency_services, star_rating)
				values (:id, :cmsId, :name, '1 Test St', 'Testville', 'ZZ', :postalCode, :type, true, :starRating)
				""")
			.param("id", id)
			.param("cmsId", "ZZ-" + id)
			.param("name", name)
			.param("postalCode", postalCode)
			.param("type", type)
			.param("starRating", starRating, java.sql.Types.SMALLINT)
			.update();
		return id;
	}

	private static MockHttpServletRequestBuilder as(UUID userId, MockHttpServletRequestBuilder request) {
		return request.with(jwt().jwt(token -> token.subject(userId.toString()).claim("email", "someone@example.com")));
	}

	private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, String body) {
		return request.contentType(MediaType.APPLICATION_JSON).content(body);
	}

}
