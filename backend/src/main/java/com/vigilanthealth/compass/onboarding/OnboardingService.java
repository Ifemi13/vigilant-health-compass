package com.vigilanthealth.compass.onboarding;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.vigilanthealth.compass.profile.GuardianProfile;
import com.vigilanthealth.compass.profile.GuardianProfileRepository;
import com.vigilanthealth.compass.profile.Pet;
import com.vigilanthealth.compass.profile.PetRepository;
import com.vigilanthealth.compass.profile.Profile;
import com.vigilanthealth.compass.profile.ProfileRepository;
import com.vigilanthealth.compass.profile.Role;
import com.vigilanthealth.compass.profile.VetProfile;
import com.vigilanthealth.compass.profile.VetProfileRepository;

@Service
public class OnboardingService {

	private final ProfileRepository profiles;

	private final GuardianProfileRepository guardians;

	private final VetProfileRepository vets;

	private final PetRepository pets;

	public OnboardingService(ProfileRepository profiles, GuardianProfileRepository guardians,
			VetProfileRepository vets, PetRepository pets) {
		this.profiles = profiles;
		this.guardians = guardians;
		this.vets = vets;
		this.pets = pets;
	}

	@Transactional(readOnly = true)
	public Optional<MeResponse> findMe(UUID userId) {
		return profiles.findById(userId).map(this::toResponse);
	}

	/**
	 * Creates the profile, its role-specific row and (for guardians) the first pet in one transaction.
	 * @param userId the Supabase auth user id, taken from the verified JWT
	 * @param loginEmail the email from the verified JWT
	 */
	@Transactional
	public MeResponse onboard(UUID userId, String loginEmail, OnboardingRequest request) {
		if (profiles.existsById(userId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Profile already exists");
		}
		if (request instanceof GuardianOnboarding guardian) {
			Profile profile = profiles.save(new Profile(userId, Role.GUARDIAN, loginEmail));
			guardians.save(new GuardianProfile(userId, guardian.phone().trim()));
			PetInput pet = guardian.pet();
			pets.save(new Pet(userId, pet.name().trim(), pet.species().trim(), blankToNull(pet.breed()), pet.sex(),
					pet.neutered(), pet.birthDate(), pet.weightKg(), blankToNull(pet.healthHistory()),
					blankToNull(pet.vaccinationHistory()), blankToNull(pet.allergies()), pet.environment(),
					pet.activityLevel(), blankToNull(pet.medications())));
			return toResponse(profile);
		}
		if (request instanceof VetOnboarding vet) {
			Profile profile = profiles.save(new Profile(userId, Role.VET, loginEmail));
			vets.save(new VetProfile(userId, vet.clinicName().trim(), vet.address().trim(), vet.email().trim()));
			return toResponse(profile);
		}
		throw new IllegalArgumentException("Unsupported onboarding request: " + request);
	}

	private MeResponse toResponse(Profile profile) {
		UUID id = profile.getId();
		if (profile.getRole() == Role.GUARDIAN) {
			MeResponse.Guardian guardian = guardians.findById(id).map(MeResponse.Guardian::of).orElse(null);
			List<MeResponse.PetView> petViews = pets.findByGuardianId(id).stream().map(MeResponse.PetView::of).toList();
			return new MeResponse(id, profile.getRole(), profile.getEmail(), guardian, null, petViews);
		}
		MeResponse.Vet vet = vets.findById(id).map(MeResponse.Vet::of).orElse(null);
		return new MeResponse(id, profile.getRole(), profile.getEmail(), null, vet, List.of());
	}

	private static String blankToNull(String value) {
		return (value == null || value.isBlank()) ? null : value.trim();
	}

}
