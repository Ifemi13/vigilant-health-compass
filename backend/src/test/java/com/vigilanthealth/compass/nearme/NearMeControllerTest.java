package com.vigilanthealth.compass.nearme;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.lessThanOrEqualTo;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.jayway.jsonpath.JsonPath;
import com.vigilanthealth.compass.TestcontainersConfiguration;

/** Runs against the real CMS / HRSA / Census data loaded by V11 and V14. */
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class NearMeControllerTest {

	@Autowired
	private MockMvc mvc;

	@Autowired
	private JdbcClient jdbc;

	@Test
	void dataIsLoadedAndEveryHospitalHasCoordinates() {
		assertThat(count("select count(*) from community_health_centers")).isEqualTo(125);
		assertThat(count("select count(*) from hospitals where state = 'WI' and latitude is null")).isZero();
		assertThat(count("select count(*) from zip_centers")).isGreaterThan(700);
	}

	@Test
	void zipSearchReturnsHospitalsAndClinicsNearestFirst() throws Exception {
		String body = mvc.perform(search("location=53703&radiusMiles=5"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.origin.label").value("53703"))
			.andExpect(jsonPath("$.radiusMiles").value(5))
			.andExpect(jsonPath("$.results[*].kind").value(hasItem("HOSPITAL")))
			.andExpect(jsonPath("$.results[*].kind").value(hasItem("CLINIC")))
			.andExpect(jsonPath("$.results[*].name").value(hasItem("University of WI Hospitals & Clinics Authority")))
			.andExpect(jsonPath("$.results[*].distanceMiles").value(everyItem(lessThanOrEqualTo(5.0))))
			.andReturn()
			.getResponse()
			.getContentAsString();
		List<Double> distances = JsonPath.read(body, "$.results[*].distanceMiles");
		assertThat(distances).isNotEmpty().isSorted();
	}

	@Test
	void resolvesCityNamesWithOrWithoutState() throws Exception {
		mvc.perform(search("location=madison")).andExpect(jsonPath("$.origin.label").value("Madison, WI"));
		mvc.perform(search("location=Green Bay, WI")).andExpect(jsonPath("$.origin.label").value("Green Bay, WI"));
	}

	@Test
	void browserCoordinatesWinOverTheTypedLocation() throws Exception {
		// Downtown Milwaukee.
		mvc.perform(search("location=Madison&lat=43.0389&lng=-87.9065&radiusMiles=3"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.origin.label").value("Your location"))
			.andExpect(jsonPath("$.results[*].city").value(hasItem("Milwaukee")));
		// The middle of Lake Michigan: nothing within a mile.
		mvc.perform(search("lat=43.0&lng=-87.0&radiusMiles=1")).andExpect(jsonPath("$.results.length()").value(0));
	}

	@Test
	void filtersByKind() throws Exception {
		mvc.perform(search("location=Milwaukee&radiusMiles=10&type=CLINIC"))
			.andExpect(jsonPath("$.results[*].kind").value(everyItem(is("CLINIC"))))
			.andExpect(jsonPath("$.results[0].organization").exists());
		mvc.perform(search("location=Milwaukee&radiusMiles=10&type=HOSPITAL"))
			.andExpect(jsonPath("$.results[*].kind").value(everyItem(is("HOSPITAL"))))
			.andExpect(jsonPath("$.results[0].locationApproximate").value(true));
	}

	@Test
	void rejectsUnknownOrMissingLocationsAndBadParameters() throws Exception {
		mvc.perform(search("location=Chicago, IL")).andExpect(status().isNotFound());
		mvc.perform(search("location=Nowhereville")).andExpect(status().isNotFound());
		mvc.perform(search("location=99999")).andExpect(status().isNotFound());
		mvc.perform(search("").param("location", "   ")).andExpect(status().isBadRequest());
		for (String query : new String[] { "", "location=53703&radiusMiles=0",
				"location=53703&radiusMiles=201", "lat=100&lng=0", "location=53703&type=PHARMACY" }) {
			mvc.perform(search(query)).andExpect(status().isBadRequest());
		}
		mvc.perform(get("/api/care-near-me?location=53703")).andExpect(status().isUnauthorized());
	}

	private int count(String sql) {
		return jdbc.sql(sql).query(Integer.class).single();
	}

	private static MockHttpServletRequestBuilder search(String query) {
		return get("/api/care-near-me?" + query).with(jwt().jwt(token -> token.subject(UUID.randomUUID().toString())));
	}

}
