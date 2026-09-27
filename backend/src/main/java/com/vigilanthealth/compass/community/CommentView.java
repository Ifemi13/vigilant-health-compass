package com.vigilanthealth.compass.community;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * A forum comment as shown to readers: the author appears only as an anonymous nickname and role.
 * @param mine whether the signed-in user wrote it
 */
public record CommentView(UUID id, String authorName, AuthorRole authorRole, String body, OffsetDateTime createdAt,
		boolean mine) {
}
