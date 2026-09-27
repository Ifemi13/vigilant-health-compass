package com.vigilanthealth.compass.community;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.vigilanthealth.compass.clinic.LocationFilter;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

/**
 * Hospitals listed on each General → Awareness topic, and each hospital's forum for that topic.
 */
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

	/**
	 * Wisconsin hospitals for a topic, near {@code location} (a ZIP code, a city, or "City, WI"), highest CMS
	 * star rating first. Mental wellness lists psychiatric hospitals first.
	 */
	@GetMapping("/topics/{topicId}/hospitals")
	public List<HospitalView> hospitals(@PathVariable String topicId,
			@RequestParam(required = false) @Size(max = 100) String location) {
		requireTopic(topicId);
		return community.hospitals(LocationFilter.parse(location),
				AwarenessTopics.PSYCHIATRIC_FIRST.contains(topicId));
	}

	@GetMapping("/hospitals/{id}")
	public HospitalView hospital(@PathVariable UUID id) {
		return community.findHospital(id).orElseThrow(HospitalNotFound::new);
	}

	/** The hospital's forum for this topic, newest first. */
	@GetMapping("/topics/{topicId}/hospitals/{id}/comments")
	public List<CommentView> comments(@PathVariable String topicId, @PathVariable UUID id,
			@AuthenticationPrincipal Jwt jwt) {
		requireForum(topicId, id);
		return community.comments(id, topicId, userId(jwt));
	}

	@PostMapping("/topics/{topicId}/hospitals/{id}/comments")
	@ResponseStatus(HttpStatus.CREATED)
	public CommentView addComment(@PathVariable String topicId, @PathVariable UUID id,
			@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody NewComment comment) {
		requireForum(topicId, id);
		UUID authorId = userId(jwt);
		return community.addComment(id, topicId, authorId, Nicknames.forUser(authorId), DEFAULT_ROLE,
				comment.body().trim());
	}

	/** Only the author can edit their comment. */
	@PutMapping("/topics/{topicId}/hospitals/{id}/comments/{commentId}")
	public CommentView editComment(@PathVariable String topicId, @PathVariable UUID id, @PathVariable UUID commentId,
			@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody NewComment comment) {
		UUID userId = userId(jwt);
		requireAuthor(topicId, id, commentId, userId);
		return community.editComment(commentId, userId, comment.body().trim());
	}

	/** Only the author can delete their comment. */
	@DeleteMapping("/topics/{topicId}/hospitals/{id}/comments/{commentId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteComment(@PathVariable String topicId, @PathVariable UUID id, @PathVariable UUID commentId,
			@AuthenticationPrincipal Jwt jwt) {
		requireAuthor(topicId, id, commentId, userId(jwt));
		community.deleteComment(commentId);
	}

	private static void requireTopic(String topicId) {
		if (!AwarenessTopics.IDS.contains(topicId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown topic");
		}
	}

	private void requireForum(String topicId, UUID hospitalId) {
		requireTopic(topicId);
		if (community.findHospital(hospitalId).isEmpty()) {
			throw new HospitalNotFound();
		}
	}

	/** 404 if the comment doesn't exist in this forum, 403 if someone else wrote it. */
	private void requireAuthor(String topicId, UUID hospitalId, UUID commentId, UUID userId) {
		UUID authorId = community.commentAuthor(hospitalId, topicId, commentId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
		if (!authorId.equals(userId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only change your own posts");
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
