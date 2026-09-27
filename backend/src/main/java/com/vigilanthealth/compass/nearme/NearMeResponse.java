package com.vigilanthealth.compass.nearme;

import java.util.List;

/**
 * @param origin where distances are measured from
 */
public record NearMeResponse(Origin origin, int radiusMiles, List<NearbyPlace> results) {

	/**
	 * @param label e.g. "53703", "Madison, WI" or "Your location"
	 */
	public record Origin(String label, double latitude, double longitude) {
	}

}
