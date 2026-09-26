package com.vigilanthealth.compass;

import org.springframework.boot.SpringApplication;

public class TestCompassApplication {

	public static void main(String[] args) {
		SpringApplication.from(CompassApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
