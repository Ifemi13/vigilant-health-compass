package com.vigilanthealth.compass.healthprofile;

import java.time.OffsetDateTime;

public record HealthProfileView(int age, HealthProfileSex sex, String currentConditions, String vaccinationHistory,
		String familyHistory, OffsetDateTime updatedAt) {
}
