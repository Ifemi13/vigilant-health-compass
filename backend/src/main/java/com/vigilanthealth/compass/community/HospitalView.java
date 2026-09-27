package com.vigilanthealth.compass.community;

import java.util.UUID;

/**
 * A specialty hospital listed on an Awareness disease page.
 * @param topicId the Awareness topic slug, e.g. {@code diabetes}
 */
public record HospitalView(UUID id, String topicId, String name, String specialty, String address, String city,
		String state, String postalCode, String phone, String website, String description) {
}
