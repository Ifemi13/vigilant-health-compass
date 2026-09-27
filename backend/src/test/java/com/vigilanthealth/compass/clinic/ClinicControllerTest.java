package com.vigilanthealth.compass.clinic;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasItem;
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

	private static final String EXAM = "zz-dog-exam";

	private static final String XRAY = "zz-dog-xray";

	@Autowired
	private MockMvc mvc;

	@Autowired
	private JdbcClient jdbc;

	private UUID alphaId;

	/**
	 * Test clinics live in state "ZZ" and test procedures start with "zz-", keeping them apart from the real
	 * Wisconsin data loaded by V6.
	 */
	@BeforeEach
	void insertTestData() {
		jdbc.sql("delete from clinics where state = 'ZZ'").update();
		jdbc.sql("delete from procedures where id like 'zz-%'").update();
		procedure(EXAM, "Exam", "exam", "60.00");
		procedure(XRAY, "X-rays", "imaging", "170.00");

		alphaId = clinic("Alpha Vet", "Testville", "99901");
		price(alphaId, "dog", "Wellness exam", "70.00", "70.00", EXAM, null);
		price(alphaId, "dog", "Sick exam", "90.00", "90.00", EXAM, null);
		price(alphaId, "cat", "Wellness exam", "65.00", "65.00", null, null);
		price(alphaId, "dog", "Nail trim", "20.00", "20.00", null, "Plus tax");

		UUID bravo = clinic("Bravo Vet", "Testville", "99902");
		price(bravo, "dog", "Office visit", "50.00", "50.00", EXAM, null);

		UUID charlie = clinic("Charlie Vet", "Testvillage", "99903");
		price(charlie, "dog", "Exam (by weight)", "300.00", "350.00", EXAM, "$350 over 75 lbs");

		UUID delta = clinic("Delta Vet", "Testville", "99901");
		price(delta, "dog", "Radiographs", "150.00", "150.00", XRAY, null);
	}

	@Test
	void realWisconsinDataIsLoaded() throws Exception {
		mvc.perform(authenticated(get("/api/clinics?procedure=dog-rabies-1-year&location=Milwaukee")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[*].name").value(contains("Wisconsin Humane Society - Milwaukee Campus")))
			.andExpect(jsonPath("$[0].prices[0].price").value(16.0));

		mvc.perform(authenticated(get("/api/procedures")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[?(@.id == 'dog-ct-scan')].usAvg").value(contains(1615.0)))
			.andExpect(jsonPath("$[?(@.id == 'dog-ct-scan')].clinicCount").value(contains(0)));
	}

	@Test
	void proceduresCountClinicsThatPriceThem() throws Exception {
		mvc.perform(authenticated(get("/api/procedures")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[?(@.id == '" + EXAM + "')].clinicCount").value(contains(3)))
			.andExpect(jsonPath("$[?(@.id == '" + EXAM + "')].species").value(contains("dog")))
			.andExpect(jsonPath("$[?(@.id == '" + XRAY + "')].usAvg").value(contains(170.0)));
	}

	@Test
	void searchGroupsPricesByClinicCheapestFirst() throws Exception {
		mvc.perform(search("procedure=" + EXAM + "&location=Testville"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[*].name").value(contains("Bravo Vet", "Alpha Vet")))
			.andExpect(jsonPath("$[1].prices[*].service").value(contains("Wellness exam", "Sick exam")))
			.andExpect(jsonPath("$[1].prices[0].species").value("dog"))
			.andExpect(jsonPath("$[1].postalCode").value("99901"));
	}

	@Test
	void costRangeIsInclusiveAndMatchesOverlappingRanges() throws Exception {
		mvc.perform(search("procedure=" + EXAM + "&minCost=50&maxCost=70&location=Testville"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[*].name").value(contains("Bravo Vet", "Alpha Vet")))
			.andExpect(jsonPath("$[1].prices[*].service").value(contains("Wellness exam")));

		// Charlie posts $300–$350, which overlaps a $320–$400 budget.
		mvc.perform(search("procedure=" + EXAM + "&minCost=320&maxCost=400&location=testvill"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[*].name").value(contains("Charlie Vet")))
			.andExpect(jsonPath("$[0].prices[0].priceHigh").value(350.0))
			.andExpect(jsonPath("$[0].prices[0].note").value("$350 over 75 lbs"));
	}

	@Test
	void matchesZipCityPrefixAndCityState() throws Exception {
		mvc.perform(search("procedure=" + EXAM + "&location=99901"))
			.andExpect(jsonPath("$[*].name").value(contains("Alpha Vet")));
		mvc.perform(search("procedure=" + EXAM + "&location=testvill"))
			.andExpect(jsonPath("$[*].name").value(contains("Bravo Vet", "Alpha Vet", "Charlie Vet")));
		mvc.perform(search("procedure=" + EXAM + "&location=Testville, zz"))
			.andExpect(jsonPath("$.length()").value(2));
		mvc.perform(search("procedure=" + EXAM + "&location=Testville, WI"))
			.andExpect(jsonPath("$.length()").value(0));
		mvc.perform(search("procedure=" + EXAM + "&location=%25"))
			.andExpect(jsonPath("$.length()").value(0));
	}

	@Test
	void rejectsInvalidParameters() throws Exception {
		for (String query : new String[] { "location=Testville", "procedure=no-such-procedure",
				"procedure=" + EXAM + "&minCost=-1", "procedure=" + EXAM + "&minCost=80&maxCost=50",
				"procedure=" + EXAM + "&maxCost=abc" }) {
			mvc.perform(search(query)).andExpect(status().isBadRequest());
		}
	}

	@Test
	void getReturnsClinicWithAllPrices() throws Exception {
		mvc.perform(authenticated(get("/api/clinics/" + alphaId)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.name").value("Alpha Vet"))
			.andExpect(jsonPath("$.prices.length()").value(4))
			.andExpect(jsonPath("$.prices[*].species").value(contains("dog", "dog", "dog", "cat")))
			.andExpect(jsonPath("$.prices[*].note").value(hasItem("Plus tax")));
	}

	@Test
	void getReturns404ForUnknownClinicAnd400ForBadId() throws Exception {
		mvc.perform(authenticated(get("/api/clinics/" + UUID.randomUUID()))).andExpect(status().isNotFound());
		mvc.perform(authenticated(get("/api/clinics/not-a-uuid"))).andExpect(status().isBadRequest());
	}

	@Test
	void requiresAuthentication() throws Exception {
		mvc.perform(get("/api/procedures")).andExpect(status().isUnauthorized());
		mvc.perform(get("/api/clinics?procedure=" + EXAM)).andExpect(status().isUnauthorized());
		mvc.perform(get("/api/clinics/" + alphaId)).andExpect(status().isUnauthorized());
	}

	private MockHttpServletRequestBuilder search(String query) {
		return authenticated(get("/api/clinics?" + query));
	}

	private static MockHttpServletRequestBuilder authenticated(MockHttpServletRequestBuilder request) {
		return request.with(jwt().jwt(token -> token.subject(UUID.randomUUID().toString())));
	}

	private void procedure(String id, String name, String category, String usAvg) {
		jdbc.sql("""
				insert into procedures (id, species, category, name, avg_price, avg_basis, us_avg)
				values (:id, 'dog', :category, :name, :usAvg, 'U.S. average', :usAvg)
				""").param("id", id).param("category", category).param("name", name)
			.param("usAvg", new BigDecimal(usAvg)).update();
	}

	private UUID clinic(String name, String city, String postalCode) {
		UUID id = UUID.randomUUID();
		jdbc.sql("""
				insert into clinics (id, organization, name, provider_type, city, state, postal_code)
				values (:id, :name, :name, 'shelter clinic', :city, 'ZZ', :postalCode)
				""").param("id", id).param("name", name).param("city", city).param("postalCode", postalCode).update();
		return id;
	}

	private void price(UUID clinicId, String species, String service, String price, String priceHigh,
			String procedureId, String note) {
		jdbc.sql("""
				insert into clinic_prices (clinic_id, species, category, service, price, price_high, procedure_id,
				                           note, date_checked)
				values (:clinicId, :species, 'exam', :service, :price, :priceHigh, :procedureId, :note, current_date)
				""")
			.param("clinicId", clinicId)
			.param("species", species)
			.param("service", service)
			.param("price", new BigDecimal(price))
			.param("priceHigh", new BigDecimal(priceHigh))
			.param("procedureId", procedureId)
			.param("note", note)
			.update();
	}

}
