package com.vigilanthealth.compass.clinic;

import static org.hamcrest.Matchers.contains;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.vigilanthealth.compass.TestcontainersConfiguration;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class ClinicControllerTest {

	@Autowired
	private MockMvc mvc;

	@Autowired
	private JdbcClient jdbc;

	private UUID foxtrotId;

	/** Test clinics live in state "ZZ" so location filters keep them apart from the V3 demo seed. */
	@BeforeEach
	void insertClinics() {
		jdbc.sql("delete from clinics where state = 'ZZ'").update();
		clinic("Alpha Vet", "Testville", "99901", "EXAM", "70.00", "DENTAL", "500.00");
		clinic("Bravo Vet", "Testville", "99902", "EXAM", "50.00", "VACCINATION", "25.00");
		clinic("Charlie Vet", "Testville", "99901", "EXAM", "90.00");
		clinic("Delta Vet", "Testvillage", "99903", "EXAM", "40.00");
		clinic("Echo Vet", "Testville", "99902", "DENTAL", "300.00");
		foxtrotId = clinic("Foxtrot Hospital", "Foxton", "99904", "MRI", "2500.00", "EXAM", "80.00", "XRAY", "200.00",
				"CONSULT", "120.00");
	}

	@Test
	void filtersByServiceAndInclusiveCostRangeCheapestFirst() throws Exception {
		mvc.perform(search("service=EXAM&minCost=50&maxCost=70&location=Testville"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(2))
			.andExpect(jsonPath("$[0].name").value("Bravo Vet"))
			.andExpect(jsonPath("$[0].price").value(50.0))
			.andExpect(jsonPath("$[1].name").value("Alpha Vet"))
			.andExpect(jsonPath("$[1].price").value(70.0))
			.andExpect(jsonPath("$[1].addressLine").value("1 Test St"))
			.andExpect(jsonPath("$[1].services.length()").value(2))
			.andExpect(jsonPath("$[1].services[0].service").value("EXAM"))
			.andExpect(jsonPath("$[1].services[1].service").value("DENTAL"))
			.andExpect(jsonPath("$[1].services[1].price").value(500.0));
	}

	@Test
	void excludesClinicsThatDontOfferTheService() throws Exception {
		mvc.perform(search("service=EXAM&location=Testville"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[*].name").value(contains("Bravo Vet", "Alpha Vet", "Charlie Vet")));
	}

	@Test
	void matchesZipCode() throws Exception {
		mvc.perform(search("service=EXAM&location=99901"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[*].name").value(contains("Alpha Vet", "Charlie Vet")));
	}

	@Test
	void matchesCityPrefixIgnoringCase() throws Exception {
		mvc.perform(search("service=EXAM&location=testvill"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[*].name")
				.value(contains("Delta Vet", "Bravo Vet", "Alpha Vet", "Charlie Vet")));
	}

	@Test
	void matchesCityAndState() throws Exception {
		mvc.perform(search("service=EXAM&location=Testville, zz"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(3));

		mvc.perform(search("service=EXAM&location=Testville, WI"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(0));
	}

	@Test
	void treatsLikeWildcardsInLocationLiterally() throws Exception {
		mvc.perform(search("service=EXAM&location=%25")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
	}

	@Test
	void rejectsInvalidParameters() throws Exception {
		for (String query : new String[] { "location=Testville", "service=GROOMING", "service=EXAM&minCost=-1",
				"service=EXAM&minCost=80&maxCost=50", "service=EXAM&maxCost=abc" }) {
			mvc.perform(search(query)).andExpect(status().isBadRequest());
		}
	}

	@Test
	void searchesNewerServiceTypes() throws Exception {
		mvc.perform(search("service=MRI&location=Foxton"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[*].name").value(contains("Foxtrot Hospital")))
			.andExpect(jsonPath("$[0].price").value(2500.0));
	}

	@Test
	void getReturnsClinicWithServicesInDisplayOrder() throws Exception {
		mvc.perform(authenticated(get("/api/clinics/" + foxtrotId)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.name").value("Foxtrot Hospital"))
			.andExpect(jsonPath("$.city").value("Foxton"))
			.andExpect(jsonPath("$.price").doesNotExist())
			.andExpect(jsonPath("$.services[*].service").value(contains("EXAM", "CONSULT", "XRAY", "MRI")))
			.andExpect(jsonPath("$.services[3].price").value(2500.0));
	}

	@Test
	void getReturns404ForUnknownClinicAnd400ForBadId() throws Exception {
		mvc.perform(authenticated(get("/api/clinics/" + UUID.randomUUID()))).andExpect(status().isNotFound());
		mvc.perform(authenticated(get("/api/clinics/not-a-uuid"))).andExpect(status().isBadRequest());
	}

	@Test
	void requiresAuthentication() throws Exception {
		mvc.perform(get("/api/clinics?service=EXAM")).andExpect(status().isUnauthorized());
		mvc.perform(get("/api/clinics/" + foxtrotId)).andExpect(status().isUnauthorized());
	}

	private MockHttpServletRequestBuilder search(String query) {
		return authenticated(get("/api/clinics?" + query));
	}

	private static MockHttpServletRequestBuilder authenticated(MockHttpServletRequestBuilder request) {
		return request.with(jwt().jwt(token -> token.subject(UUID.randomUUID().toString())));
	}

	/** Inserts a clinic in state ZZ with alternating (service, price) pairs. */
	private UUID clinic(String name, String city, String postalCode, String... servicePrices) {
		UUID id = UUID.randomUUID();
		jdbc.sql("""
				insert into clinics (id, name, address_line, city, state, postal_code)
				values (:id, :name, '1 Test St', :city, 'ZZ', :postalCode)
				""").param("id", id).param("name", name).param("city", city).param("postalCode", postalCode).update();
		for (int i = 0; i < servicePrices.length; i += 2) {
			jdbc.sql("insert into clinic_services (clinic_id, service, price) values (:id, :service, :price)")
				.param("id", id)
				.param("service", servicePrices[i])
				.param("price", new BigDecimal(servicePrices[i + 1]))
				.update();
		}
		return id;
	}

}
