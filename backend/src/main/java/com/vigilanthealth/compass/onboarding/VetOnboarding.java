package com.vigilanthealth.compass.onboarding;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VetOnboarding(
		@NotBlank @Size(max = 200) String clinicName,
		@NotBlank @Size(max = 500) String address,
		@NotBlank @Email @Size(max = 320) String email) implements OnboardingRequest {
}
