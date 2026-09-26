package com.vigilanthealth.compass.onboarding;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import com.vigilanthealth.compass.TestcontainersConfiguration;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class OnboardingControllerTest {

	private static final String GUARDIAN_BODY = """
			{
			  "role": "GUARDIAN",
			  "phone": "+1 555 0100",
			  "pet": {
			    "name": "Biscuit",
			    "species": "Dog",
			    "breed": "Beagle",
			    "sex": "FEMALE",
			    "neutered": true,
			    "birthDate": "2021-03-01",
			    "weightKg": 11.5,
			    "healthHistory": "Hip dysplasia",
			    "vaccinationHistory": "Rabies 2025-02",
			    "allergies": "  "
			  }
			}
			""";

	private static final String VET_BODY = """
			{
			  "role": "VET",
			  "clinicName": "Northside Animal Hospital",
			  "address": "1 Main St, Springfield",
			  "email": "front-desk@northside.example"
			}
			""";

	@Autowired
	private MockMvc mvc;

	@Test
	void meReturns401WithoutToken() throws Exception {
		mvc.perform(get("/api/me")).andExpect(status().isUnauthorized());
	}

	@Test
	void meReturns404BeforeOnboarding() throws Exception {
		mvc.perform(get("/api/me").with(user(UUID.randomUUID()))).andExpect(status().isNotFound());
	}

	@Test
	void guardianOnboardingStoresProfileAndPet() throws Exception {
		RequestPostProcessor user = user(UUID.randomUUID());

		mvc.perform(json(post("/api/onboarding"), GUARDIAN_BODY).with(user))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.role").value("GUARDIAN"));

		mvc.perform(get("/api/me").with(user))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.role").value("GUARDIAN"))
			.andExpect(jsonPath("$.email").value("user@example.com"))
			.andExpect(jsonPath("$.guardian.phone").value("+1 555 0100"))
			.andExpect(jsonPath("$.vet").doesNotExist())
			.andExpect(jsonPath("$.pets.length()").value(1))
			.andExpect(jsonPath("$.pets[0].name").value("Biscuit"))
			.andExpect(jsonPath("$.pets[0].sex").value("FEMALE"))
			.andExpect(jsonPath("$.pets[0].weightKg").value(11.5))
			.andExpect(jsonPath("$.pets[0].allergies").doesNotExist());
	}

	@Test
	void vetOnboardingStoresClinic() throws Exception {
		RequestPostProcessor user = user(UUID.randomUUID());

		mvc.perform(json(post("/api/onboarding"), VET_BODY).with(user)).andExpect(status().isCreated());

		mvc.perform(get("/api/me").with(user))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.role").value("VET"))
			.andExpect(jsonPath("$.vet.clinicName").value("Northside Animal Hospital"))
			.andExpect(jsonPath("$.vet.email").value("front-desk@northside.example"))
			.andExpect(jsonPath("$.guardian").doesNotExist())
			.andExpect(jsonPath("$.pets.length()").value(0));
	}

	@Test
	void onboardingTwiceReturns409() throws Exception {
		RequestPostProcessor user = user(UUID.randomUUID());

		mvc.perform(json(post("/api/onboarding"), VET_BODY).with(user)).andExpect(status().isCreated());
		mvc.perform(json(post("/api/onboarding"), GUARDIAN_BODY).with(user)).andExpect(status().isConflict());
	}

	@Test
	void invalidBodyReturns400() throws Exception {
		String missingPet = """
				{ "role": "GUARDIAN", "phone": "555" }
				""";
		String badEmail = VET_BODY.replace("front-desk@northside.example", "not-an-email");
		String unknownRole = """
				{ "role": "ADMIN" }
				""";

		for (String body : new String[] { missingPet, badEmail, unknownRole }) {
			mvc.perform(json(post("/api/onboarding"), body).with(user(UUID.randomUUID())))
				.andExpect(status().isBadRequest());
		}
	}

	@Test
	void corsPreflightAllowsFrontendOriginOnly() throws Exception {
		mvc.perform(options("/api/me").header("Origin", "http://localhost:5173")
				.header("Access-Control-Request-Method", "GET")
				.header("Access-Control-Request-Headers", "authorization"))
			.andExpect(status().isOk())
			.andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));

		mvc.perform(options("/api/me").header("Origin", "https://evil.example")
				.header("Access-Control-Request-Method", "GET"))
			.andExpect(status().isForbidden());
	}

	private static RequestPostProcessor user(UUID id) {
		return jwt().jwt(token -> token.subject(id.toString()).claim("email", "user@example.com"));
	}

	private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, String body) {
		return request.contentType(MediaType.APPLICATION_JSON).content(body);
	}

}
