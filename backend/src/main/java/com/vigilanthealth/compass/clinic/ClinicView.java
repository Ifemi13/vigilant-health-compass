package com.vigilanthealth.compass.clinic;

import java.util.List;
import java.util.UUID;

/**
 * A clinic location with prices. In search results {@code prices} holds only the prices matching the search
 * (cheapest first); for a single clinic it holds every price the clinic posted.
 */
public record ClinicView(UUID id, String organization, String name, String providerType, String address,
		String city, String state, String postalCode, String eligibility, String sourceUrl,
		List<ClinicPrice> prices) {

	ClinicView withPrices(List<ClinicPrice> prices) {
		return new ClinicView(id, organization, name, providerType, address, city, state, postalCode, eligibility,
				sourceUrl, prices);
	}

}
