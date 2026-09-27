package com.vigilanthealth.compass.community;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.vigilanthealth.compass.healthprofile.HealthProfileSex;

/**
 * A forum comment as shown to readers: the author appears only as an anonymous nickname and role, plus the age
 * and sex from their Health Profile if they have filled one in.
 * @param authorAge from the author's current Health Profile, or null
 * @param authorSex from the author's current Health Profile, or null
 * @param editedAt when the author last edited it, or null
 * @param mine whether the signed-in user wrote it (and so may edit or delete it)
 */
public record CommentView(UUID id, String authorName, AuthorRole authorRole, Integer authorAge,
		HealthProfileSex authorSex, String body, OffsetDateTime createdAt, OffsetDateTime editedAt, boolean mine) {
}
