package com.vigilanthealth.compass.clinic;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api")
public class ClinicController {

	private final ClinicSearchRepository clinics;

	public ClinicController(ClinicSearchRepository clinics) {
		this.clinics = clinics;
	}

	/**
	 * Clinics offering {@code service} priced between {@code minCost} and {@code maxCost} (inclusive), near
	 * {@code location} (a ZIP code, a city, or "City, ST"), cheapest first.
	 */
	@GetMapping("/clinics")
	public List<ClinicResult> search(@RequestParam ServiceType service,
			@RequestParam(required = false) @PositiveOrZero BigDecimal minCost,
			@RequestParam(required = false) @PositiveOrZero BigDecimal maxCost,
			@RequestParam(required = false) @Size(max = 100) String location) {
		if (minCost != null && maxCost != null && minCost.compareTo(maxCost) > 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "minCost must not be greater than maxCost");
		}
		return clinics.search(service, minCost, maxCost, LocationFilter.parse(location));
	}

	/**
	 * One clinic with all of its services and prices, or 404.
	 */
	@GetMapping("/clinics/{id}")
	public ClinicDetail get(@PathVariable UUID id) {
		return clinics.findById(id)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Clinic not found"));
	}

}
