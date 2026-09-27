package com.vigilanthealth.compass.community;

import java.util.UUID;

/**
 * A Wisconsin hospital from CMS Hospital General Information.
 * @param hospitalType e.g. "Acute Care Hospitals", "Critical Access Hospitals", "Psychiatric"
 * @param starRating CMS overall star rating (1–5), or null when CMS has none
 */
public record HospitalView(UUID id, String name, String address, String city, String state, String postalCode,
		String county, String phone, String hospitalType, String ownership, boolean emergencyServices,
		Integer starRating) {
}
