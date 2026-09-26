package com.vigilanthealth.compass.profile;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PetRepository extends JpaRepository<Pet, UUID> {

	List<Pet> findByGuardianId(UUID guardianId);

}
