package com.vigilanthealth.compass.onboarding;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.vigilanthealth.compass.profile.Sex;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record PetInput(
		@NotBlank @Size(max = 100) String name,
		@NotBlank @Size(max = 50) String species,
		@Size(max = 100) String breed,
		@NotNull Sex sex,
		boolean neutered,
		@PastOrPresent LocalDate birthDate,
		@Positive @DecimalMax("5000") @Digits(integer = 4, fraction = 2) BigDecimal weightKg,
		@Size(max = 5000) String healthHistory,
		@Size(max = 5000) String vaccinationHistory,
		@Size(max = 2000) String allergies) {
}
