package com.vigilanthealth.compass.clinic;

import java.util.regex.Pattern;

/**
 * What the user typed in the location box, parsed into a ZIP code, or a city prefix with an optional state
 * (e.g. {@code "Madison, WI"}). All fields are null when the box was left blank.
 */
public record LocationFilter(String postalCode, String city, String state) {

	private static final Pattern ZIP = Pattern.compile("\\d{5}");

	private static final Pattern CITY_STATE = Pattern.compile("(.+),\\s*([A-Za-z]{2})");

	static final LocationFilter ANY = new LocationFilter(null, null, null);

	public static LocationFilter parse(String input) {
		if (input == null || input.isBlank()) {
			return ANY;
		}
		String value = input.trim();
		if (ZIP.matcher(value).matches()) {
			return new LocationFilter(value, null, null);
		}
		var cityState = CITY_STATE.matcher(value);
		if (cityState.matches()) {
			return new LocationFilter(null, cityState.group(1).trim(), cityState.group(2).toUpperCase());
		}
		return new LocationFilter(null, value, null);
	}

}
