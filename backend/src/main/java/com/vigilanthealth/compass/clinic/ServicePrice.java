package com.vigilanthealth.compass.clinic;

import java.math.BigDecimal;

public record ServicePrice(ServiceType service, BigDecimal price) {
}
