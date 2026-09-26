package com.vigilanthealth.compass.clinic;

import java.util.List;
import java.util.UUID;

/**
 * A single clinic with every service it offers and its price.
 */
public record ClinicDetail(UUID id, String name, String addressLine, String city, String state, String postalCode,
		String phone, String email, String website, List<ServicePrice> services) {

	ClinicDetail withServices(List<ServicePrice> services) {
		return new ClinicDetail(id, name, addressLine, city, state, postalCode, phone, email, website, services);
	}

}
