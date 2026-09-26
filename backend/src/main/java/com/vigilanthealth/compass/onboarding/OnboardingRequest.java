package com.vigilanthealth.compass.onboarding;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Body of {@code POST /api/onboarding}. The {@code role} property selects the variant.
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "role")
@JsonSubTypes({
		@JsonSubTypes.Type(value = GuardianOnboarding.class, name = "GUARDIAN"),
		@JsonSubTypes.Type(value = VetOnboarding.class, name = "VET") })
public sealed interface OnboardingRequest permits GuardianOnboarding, VetOnboarding {
}
