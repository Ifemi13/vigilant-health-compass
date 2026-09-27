package com.vigilanthealth.compass.community;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NewComment(@NotBlank @Size(max = 2000) String body) {
}
