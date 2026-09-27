package com.vigilanthealth.compass.nearme;

import java.util.UUID;

/**
 * A hospital (CMS) or community health center (HRSA) near the searched location.
 * @param category hospital type (e.g. "Acute Care Hospitals") or health center type (e.g. "Federally Qualified
 * Health Center (FQHC)")
 * @param organization the health center organization running a clinic; null for hospitals
 * @param locationApproximate true when the coordinates are a ZIP or city center rather than the building
 * @param starRating CMS overall rating for hospitals; null for clinics or unrated hospitals
 * @param emergencyServices whether a hospital has an emergency department; null for clinics
 */
public record NearbyPlace(CareKind kind, UUID id, String name, String category, String organization, String address,
		String city, String state, String postalCode, String phone, String website, double distanceMiles,
		boolean locationApproximate, Integer starRating, Boolean emergencyServices) {
}
