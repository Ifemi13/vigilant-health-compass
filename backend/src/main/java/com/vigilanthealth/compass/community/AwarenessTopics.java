package com.vigilanthealth.compass.community;

import java.util.Set;

/**
 * The General → Awareness topic slugs that have hospital forums. Keep in sync with
 * {@code frontend/src/content/awarenessTopics.ts}.
 */
final class AwarenessTopics {

	static final Set<String> IDS = Set.of("cardiovascular-health", "diabetes", "cancer-awareness",
			"respiratory-health", "mental-wellness", "infectious-diseases", "nutrition", "preventive-screening",
			"vaccinations", "medication-safety", "aging-senior-health");

	/** Topics whose hospital list puts psychiatric hospitals first. */
	static final Set<String> PSYCHIATRIC_FIRST = Set.of("mental-wellness");

	private AwarenessTopics() {
	}

}
