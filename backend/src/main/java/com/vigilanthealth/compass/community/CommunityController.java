package com.vigilanthealth.compass.community;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class CommunityController {

	/** Everyone is a patient until physician accounts exist. */
	private static final AuthorRole DEFAULT_ROLE = AuthorRole.PATIENT;

	private final CommunityRepository community;

	public CommunityController(CommunityRepository community) {
		this.community = community;
	}

	/** How the signed-in user appears in the forum. */
	@GetMapping("/community/me")
	public CommunityIdentity me(@AuthenticationPrincipal Jwt jwt) {
		return new CommunityIdentity(Nicknames.forUser(userId(jwt)), DEFAULT_ROLE);
	}

	@GetMapping("/topics/{topicId}/hospitals")
	public List<HospitalView> hospitals(@PathVariable String topicId) {
		return community.hospitalsForTopic(topicId);
	}

	@GetMapping("/hospitals/{id}")
	public HospitalView hospital(@PathVariable UUID id) {
		return community.findHospital(id).orElseThrow(HospitalNotFound::new);
	}

	/** Newest first. */
	@GetMapping("/hospitals/{id}/comments")
	public List<CommentView> comments(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
		requireHospital(id);
		return community.comments(id, userId(jwt));
	}

	@PostMapping("/hospitals/{id}/comments")
	@ResponseStatus(HttpStatus.CREATED)
	public CommentView addComment(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt,
			@Valid @RequestBody NewComment comment) {
		requireHospital(id);
		UUID authorId = userId(jwt);
		return community.addComment(id, authorId, Nicknames.forUser(authorId), DEFAULT_ROLE, comment.body().trim());
	}

	private void requireHospital(UUID id) {
		if (community.findHospital(id).isEmpty()) {
			throw new HospitalNotFound();
		}
	}

	private static UUID userId(Jwt jwt) {
		return UUID.fromString(jwt.getSubject());
	}

	public record CommunityIdentity(String nickname, AuthorRole role) {
	}

	private static class HospitalNotFound extends ResponseStatusException {

		HospitalNotFound() {
			super(HttpStatus.NOT_FOUND, "Hospital not found");
		}

	}

}
