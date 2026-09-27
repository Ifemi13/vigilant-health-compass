-- When a comment was last edited by its author; null if never edited.
alter table hospital_comments add column edited_at timestamptz;
