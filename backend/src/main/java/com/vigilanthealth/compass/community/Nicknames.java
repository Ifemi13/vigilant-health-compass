package com.vigilanthealth.compass.community;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.UUID;

/**
 * Anonymous display names for the community forum, e.g. "Quiet Heron". The same user always gets the same
 * nickname (it is derived from a hash of their user id), and it reveals nothing about who they are.
 */
public final class Nicknames {

	private static final List<String> ADJECTIVES = List.of("Quiet", "Brave", "Gentle", "Bright", "Calm", "Clever",
			"Kind", "Swift", "Steady", "Sunny", "Hopeful", "Patient", "Cheerful", "Curious", "Friendly", "Honest",
			"Lively", "Loyal", "Mellow", "Noble", "Peaceful", "Proud", "Silver", "Golden", "Wise", "Warm", "Bold",
			"Merry", "Nimble", "Radiant", "Serene", "Humble");

	private static final List<String> ANIMALS = List.of("Heron", "Otter", "Fox", "Badger", "Robin", "Falcon", "Deer",
			"Owl", "Crane", "Lynx", "Beaver", "Sparrow", "Finch", "Loon", "Hare", "Moose", "Bison", "Wren", "Eagle",
			"Seal", "Panda", "Koala", "Dolphin", "Turtle", "Swan", "Raven", "Bear", "Wolf", "Puffin", "Hawk", "Elk",
			"Marten");

	private Nicknames() {
	}

	public static String forUser(UUID userId) {
		byte[] hash = sha256(userId.toString());
		int adjective = Byte.toUnsignedInt(hash[0]) % ADJECTIVES.size();
		int animal = Byte.toUnsignedInt(hash[1]) % ANIMALS.size();
		return ADJECTIVES.get(adjective) + " " + ANIMALS.get(animal);
	}

	private static byte[] sha256(String value) {
		try {
			return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
		}
		catch (NoSuchAlgorithmException ex) {
			throw new IllegalStateException("SHA-256 is always available", ex);
		}
	}

}
