package com.vigilanthealth.compass.nearme;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.vigilanthealth.compass.clinic.LocationFilter;
import com.vigilanthealth.compass.nearme.NearMeResponse.Origin;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/** General → Healthcare Near Me. */
@RestController
@RequestMapping("/api/care-near-me")
public class NearMeController {

	private final NearMeRepository places;

	public NearMeController(NearMeRepository places) {
		this.places = places;
	}

	/**
	 * Hospitals and community health centers within {@code radiusMiles} of either the browser's coordinates
	 * ({@code lat}/{@code lng}) or a Wisconsin {@code location} (5-digit ZIP, city, or "City, WI"), nearest first.
	 */
	@GetMapping
	public NearMeResponse search(@RequestParam(required = false) @Size(max = 100) String location,
			@RequestParam(required = false) @DecimalMin("-90") @DecimalMax("90") Double lat,
			@RequestParam(required = false) @DecimalMin("-180") @DecimalMax("180") Double lng,
			@RequestParam(defaultValue = "25") @Min(1) @Max(200) int radiusMiles,
			@RequestParam(required = false) CareKind type) {
		Origin origin = resolveOrigin(location, lat, lng);
		return new NearMeResponse(origin, radiusMiles,
				places.search(origin.latitude(), origin.longitude(), radiusMiles, type));
	}

	private Origin resolveOrigin(String location, Double lat, Double lng) {
		if (lat != null && lng != null) {
			return new Origin("Your location", lat, lng);
		}
		LocationFilter filter = LocationFilter.parse(location);
		if (filter.postalCode() != null) {
			return places.zipCenter(filter.postalCode()).orElseThrow(() -> notFound(location));
		}
		if (filter.city() != null && (filter.state() == null || filter.state().equals("WI"))) {
			return places.placeCenter(filter.city()).orElseThrow(() -> notFound(location));
		}
		if (filter.city() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a city or ZIP code, or share your location");
		}
		throw notFound(location);
	}

	private static ResponseStatusException notFound(String location) {
		return new ResponseStatusException(HttpStatus.NOT_FOUND,
				"We couldn't find \"" + location.trim() + "\" in Wisconsin. Try a city or 5-digit ZIP code.");
	}

}
