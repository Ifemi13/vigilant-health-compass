package com.vigilanthealth.compass.onboarding;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.vigilanthealth.compass.profile.GuardianProfile;
import com.vigilanthealth.compass.profile.Pet;
import com.vigilanthealth.compass.profile.Role;
import com.vigilanthealth.compass.profile.Sex;
import com.vigilanthealth.compass.profile.VetProfile;

/**
 * Body of {@code GET /api/me}. Exactly one of {@code guardian} / {@code vet} is set, matching {@code role}.
 */
public record MeResponse(UUID id, Role role, String email, Guardian guardian, Vet vet, List<PetView> pets) {

	public record Guardian(String phone) {

		static Guardian of(GuardianProfile profile) {
			return new Guardian(profile.getPhone());
		}

	}

	public record Vet(String clinicName, String address, String email) {

		static Vet of(VetProfile profile) {
			return new Vet(profile.getClinicName(), profile.getAddress(), profile.getEmail());
		}

	}

	public record PetView(UUID id, String name, String species, String breed, Sex sex, boolean neutered,
			LocalDate birthDate, BigDecimal weightKg, String healthHistory, String vaccinationHistory,
			String allergies) {

		static PetView of(Pet pet) {
			return new PetView(pet.getId(), pet.getName(), pet.getSpecies(), pet.getBreed(), pet.getSex(),
					pet.isNeutered(), pet.getBirthDate(), pet.getWeightKg(), pet.getHealthHistory(),
					pet.getVaccinationHistory(), pet.getAllergies());
		}

	}

}
