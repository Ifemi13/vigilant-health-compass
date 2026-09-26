package com.vigilanthealth.compass.profile;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "guardian_profiles")
public class GuardianProfile {

	@Id
	private UUID userId;

	private String phone;

	protected GuardianProfile() {
	}

	public GuardianProfile(UUID userId, String phone) {
		this.userId = userId;
		this.phone = phone;
	}

	public UUID getUserId() {
		return userId;
	}

	public String getPhone() {
		return phone;
	}

}
