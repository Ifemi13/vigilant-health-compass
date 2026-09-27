package com.vigilanthealth.compass.profile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "pets")
public class Pet {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	private UUID guardianId;

	private String name;

	private String species;

	private String breed;

	@Enumerated(EnumType.STRING)
	private Sex sex;

	private boolean neutered;

	private LocalDate birthDate;

	private BigDecimal weightKg;

	private String healthHistory;

	private String vaccinationHistory;

	private String allergies;

	@Enumerated(EnumType.STRING)
	private PetEnvironment environment;

	@Enumerated(EnumType.STRING)
	private ActivityLevel activityLevel;

	private String medications;

	protected Pet() {
	}

	public Pet(UUID guardianId, String name, String species, String breed, Sex sex, boolean neutered,
			LocalDate birthDate, BigDecimal weightKg, String healthHistory, String vaccinationHistory,
			String allergies, PetEnvironment environment, ActivityLevel activityLevel, String medications) {
		this.guardianId = guardianId;
		this.name = name;
		this.species = species;
		this.breed = breed;
		this.sex = sex;
		this.neutered = neutered;
		this.birthDate = birthDate;
		this.weightKg = weightKg;
		this.healthHistory = healthHistory;
		this.vaccinationHistory = vaccinationHistory;
		this.allergies = allergies;
		this.environment = environment;
		this.activityLevel = activityLevel;
		this.medications = medications;
	}

	public UUID getId() {
		return id;
	}

	public UUID getGuardianId() {
		return guardianId;
	}

	public String getName() {
		return name;
	}

	public String getSpecies() {
		return species;
	}

	public String getBreed() {
		return breed;
	}

	public Sex getSex() {
		return sex;
	}

	public boolean isNeutered() {
		return neutered;
	}

	public LocalDate getBirthDate() {
		return birthDate;
	}

	public BigDecimal getWeightKg() {
		return weightKg;
	}

	public String getHealthHistory() {
		return healthHistory;
	}

	public String getVaccinationHistory() {
		return vaccinationHistory;
	}

	public String getAllergies() {
		return allergies;
	}

	public PetEnvironment getEnvironment() {
		return environment;
	}

	public ActivityLevel getActivityLevel() {
		return activityLevel;
	}

	public String getMedications() {
		return medications;
	}

}
