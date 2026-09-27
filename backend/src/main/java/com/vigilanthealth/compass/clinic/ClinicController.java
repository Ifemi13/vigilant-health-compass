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

	private final ClinicRepository clinics;

	public ClinicController(ClinicRepository clinics) {
		this.clinics = clinics;
	}

	/**
	 * Every standard procedure (both species) with reference prices and how many clinics price it.
	 */
	@GetMapping("/procedures")
	public List<ProcedureView> procedures() {
		return clinics.procedures();
	}

	/**
	 * Clinics posting a price for {@code procedure} between {@code minCost} and {@code maxCost} (inclusive),
	 * near {@code location} (a ZIP code, a city, or "City, ST"), cheapest first.
	 */
	@GetMapping("/clinics")
	public List<ClinicView> search(@RequestParam @Size(max = 100) String procedure,
			@RequestParam(required = false) @PositiveOrZero BigDecimal minCost,
			@RequestParam(required = false) @PositiveOrZero BigDecimal maxCost,
			@RequestParam(required = false) @Size(max = 100) String location) {
		if (minCost != null && maxCost != null && minCost.compareTo(maxCost) > 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "minCost must not be greater than maxCost");
		}
		if (!clinics.procedureExists(procedure)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown procedure: " + procedure);
		}
		return clinics.search(procedure, minCost, maxCost, LocationFilter.parse(location));
	}

	/**
	 * One clinic with every price it posted, or 404.
	 */
	@GetMapping("/clinics/{id}")
	public ClinicView get(@PathVariable UUID id) {
		return clinics.findById(id)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Clinic not found"));
	}

}
