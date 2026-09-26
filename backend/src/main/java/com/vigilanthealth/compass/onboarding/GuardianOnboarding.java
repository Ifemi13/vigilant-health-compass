package com.vigilanthealth.compass.onboarding;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GuardianOnboarding(
		@NotBlank @Size(max = 30) String phone,
		@NotNull @Valid PetInput pet) implements OnboardingRequest {
}
