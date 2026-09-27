package com.vigilanthealth.compass.healthprofile;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Body of {@code PUT /api/health-profile}. Vaccination and family history are optional. */
public record HealthProfileInput(
		@NotNull @Min(0) @Max(120) Integer age,
		@NotNull HealthProfileSex sex,
		@NotBlank @Size(max = 2000) String currentConditions,
		@Size(max = 2000) String vaccinationHistory,
		@Size(max = 2000) String familyHistory) {
}
