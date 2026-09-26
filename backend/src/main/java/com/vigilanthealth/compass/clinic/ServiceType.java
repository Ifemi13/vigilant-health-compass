package com.vigilanthealth.compass.clinic;

/**
 * Services a clinic can list a price for. Declaration order is the display order. Keep in sync with the
 * {@code clinic_services_service_check} constraint (V4 migration).
 */
public enum ServiceType {
	EXAM, CONSULT, VACCINATION, BLOOD_WORK, XRAY, ULTRASOUND, CT_SCAN, MRI, DENTAL, SPAY_NEUTER, EMERGENCY
}
