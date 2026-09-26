package com.vigilanthealth.compass.profile;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GuardianProfileRepository extends JpaRepository<GuardianProfile, UUID> {
}
