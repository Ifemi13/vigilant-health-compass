package com.vigilanthealth.compass.clinic;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * One clinic in a search result. {@code price} is the price of the searched service; {@code services} lists
 * every service the clinic offers.
 */
public record ClinicResult(UUID id, String name, String addressLine, String city, String state, String postalCode,
		String phone, String email, String website, BigDecimal price, List<ServicePrice> services) {

	ClinicResult withServices(List<ServicePrice> services) {
		return new ClinicResult(id, name, addressLine, city, state, postalCode, phone, email, website, price,
				services);
	}

}
