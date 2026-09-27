package com.vigilanthealth.compass.clinic;

import java.math.BigDecimal;

/**
 * A standard procedure for one species with its reference prices.
 * @param avgPrice best available average (see {@code avgBasis}); null when no data was found
 * @param usAvg U.S. (national) average, when known
 * @param clinicCount number of clinics that post a price for this procedure
 */
public record ProcedureView(String id, String species, String category, String name, BigDecimal avgPrice,
		String avgBasis, BigDecimal usAvg, int clinicCount) {
}
