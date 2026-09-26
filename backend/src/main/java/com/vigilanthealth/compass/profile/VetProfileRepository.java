package com.vigilanthealth.compass.profile;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VetProfileRepository extends JpaRepository<VetProfile, UUID> {
}
