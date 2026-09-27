package com.vigilanthealth.compass.healthprofile;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

/** The signed-in user's General → Health Profile. */
@RestController
@RequestMapping("/api/health-profile")
public class HealthProfileController {

	private final HealthProfileRepository profiles;

	public HealthProfileController(HealthProfileRepository profiles) {
		this.profiles = profiles;
	}

	/** 404 until the user has saved one. */
	@GetMapping
	public HealthProfileView get(@AuthenticationPrincipal Jwt jwt) {
		return profiles.find(userId(jwt))
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No health profile yet"));
	}

	/** Creates or replaces the profile. */
	@PutMapping
	public HealthProfileView save(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody HealthProfileInput input) {
		return profiles.save(userId(jwt), input);
	}

	private static UUID userId(Jwt jwt) {
		return UUID.fromString(jwt.getSubject());
	}

}
