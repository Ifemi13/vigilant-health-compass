package com.vigilanthealth.compass.profile;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "vet_profiles")
public class VetProfile {

	@Id
	private UUID userId;

	private String clinicName;

	private String address;

	private String email;

	protected VetProfile() {
	}

	public VetProfile(UUID userId, String clinicName, String address, String email) {
		this.userId = userId;
		this.clinicName = clinicName;
		this.address = address;
		this.email = email;
	}

	public UUID getUserId() {
		return userId;
	}

	public String getClinicName() {
		return clinicName;
	}

	public String getAddress() {
		return address;
	}

	public String getEmail() {
		return email;
	}

}
