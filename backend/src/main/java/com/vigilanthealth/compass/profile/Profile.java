package com.vigilanthealth.compass.profile;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "profiles")
public class Profile {

	@Id
	private UUID id;

	@Enumerated(EnumType.STRING)
	private Role role;

	private String email;

	protected Profile() {
	}

	public Profile(UUID id, Role role, String email) {
		this.id = id;
		this.role = role;
		this.email = email;
	}

	public UUID getId() {
		return id;
	}

	public Role getRole() {
		return role;
	}

	public String getEmail() {
		return email;
	}

}
