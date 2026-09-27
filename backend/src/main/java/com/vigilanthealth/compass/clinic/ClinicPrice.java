package com.vigilanthealth.compass.clinic;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * A price a clinic posted for one service for one species.
 * @param priceHigh equal to {@code price} unless the clinic posted a range
 * @param procedureId the standard procedure this service matches, or null
 */
public record ClinicPrice(String species, String category, String service, BigDecimal price, BigDecimal priceHigh,
		String procedureId, String note, LocalDate priceAsOf) {
}
