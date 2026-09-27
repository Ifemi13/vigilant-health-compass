package com.vigilanthealth.compass.healthprofile;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.vigilanthealth.compass.TestcontainersConfiguration;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class HealthProfileControllerTest {

	private static final String FULL = """
			{ "age": 42, "sex": "FEMALE", "currentConditions": "  High blood pressure  ",
			  "vaccinationHistory": "Flu 2025, Tdap 2019", "familyHistory": "Mother: breast cancer" }
			""";

	@Autowired
	private MockMvc mvc;

	@Test
	void notFoundUntilSavedThenReturnsTheProfile() throws Exception {
		UUID user = UUID.randomUUID();
		mvc.perform(as(user, get("/api/health-profile"))).andExpect(status().isNotFound());

		mvc.perform(as(user, json(put("/api/health-profile"), FULL)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.age").value(42))
			.andExpect(jsonPath("$.sex").value("FEMALE"))
			.andExpect(jsonPath("$.currentConditions").value("High blood pressure"))
			.andExpect(jsonPath("$.updatedAt").exists());

		mvc.perform(as(user, get("/api/health-profile")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.familyHistory").value("Mother: breast cancer"));
	}

	@Test
	void savingAgainReplacesTheProfileAndOptionalFieldsCanBeBlank() throws Exception {
		UUID user = UUID.randomUUID();
		mvc.perform(as(user, json(put("/api/health-profile"), FULL))).andExpect(status().isOk());
		mvc.perform(as(user, json(put("/api/health-profile"), """
				{ "age": 43, "sex": "PREFER_NOT_TO_SAY", "currentConditions": "None", "vaccinationHistory": "  " }
				""")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.age").value(43))
			.andExpect(jsonPath("$.vaccinationHistory").doesNotExist())
			.andExpect(jsonPath("$.familyHistory").doesNotExist());
	}

	@Test
	void profilesArePrivateToEachUser() throws Exception {
		mvc.perform(as(UUID.randomUUID(), json(put("/api/health-profile"), FULL))).andExpect(status().isOk());
		mvc.perform(as(UUID.randomUUID(), get("/api/health-profile"))).andExpect(status().isNotFound());
	}

	@Test
	void rejectsMissingRequiredFieldsAndBadValues() throws Exception {
		for (String body : new String[] { "{ \"sex\": \"MALE\", \"currentConditions\": \"None\" }",
				"{ \"age\": 30, \"currentConditions\": \"None\" }", "{ \"age\": 30, \"sex\": \"MALE\" }",
				"{ \"age\": 30, \"sex\": \"MALE\", \"currentConditions\": \"  \" }",
				"{ \"age\": 121, \"sex\": \"MALE\", \"currentConditions\": \"None\" }",
				"{ \"age\": 30, \"sex\": \"UNKNOWN\", \"currentConditions\": \"None\" }" }) {
			mvc.perform(as(UUID.randomUUID(), json(put("/api/health-profile"), body))).andExpect(status().isBadRequest());
		}
		mvc.perform(json(put("/api/health-profile"), FULL)).andExpect(status().isUnauthorized());
	}

	private static MockHttpServletRequestBuilder as(UUID userId, MockHttpServletRequestBuilder request) {
		return request.with(jwt().jwt(token -> token.subject(userId.toString())));
	}

	private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, String body) {
		return request.contentType(MediaType.APPLICATION_JSON).content(body);
	}

}
