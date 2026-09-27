-- Replaces the fictional demo hospitals (V7/V8) with real Wisconsin hospitals from CMS (loaded by V11).
-- CMS data has no specialties, so every Awareness topic lists the same hospitals and each hospital has a
-- separate forum per topic: comments are keyed by (hospital, topic).

drop table hospital_comments;
drop table specialty_hospitals;

create table hospitals (
    id                 uuid primary key,
    cms_facility_id    text     not null unique, -- CMS Certification Number
    name               text     not null,
    address            text     not null,
    city               text     not null,
    state              text     not null,
    postal_code        text,
    county             text,
    phone              text,
    hospital_type      text     not null, -- e.g. 'Acute Care Hospitals', 'Psychiatric'
    ownership          text,
    emergency_services boolean  not null,
    star_rating        smallint check (star_rating between 1 and 5) -- CMS overall rating; null when not available
);

create index hospitals_city_idx on hospitals (lower(city));
create index hospitals_postal_code_idx on hospitals (postal_code);

create table hospital_comments (
    id          uuid primary key default gen_random_uuid(),
    hospital_id uuid        not null references hospitals (id) on delete cascade,
    topic_id    text        not null, -- the Awareness topic slug, e.g. 'diabetes'
    author_id   uuid        not null, -- Supabase auth user id; never returned by the API
    author_name text        not null, -- anonymized nickname shown instead of the author's identity
    author_role text        not null check (author_role in ('PATIENT', 'PHYSICIAN')),
    body        text        not null check (char_length(body) between 1 and 2000),
    created_at  timestamptz not null default now(),
    edited_at   timestamptz
);

create index hospital_comments_thread_idx on hospital_comments (hospital_id, topic_id, created_at desc);

-- See V1: blocks the anon key from reading these via Supabase's REST API.
alter table hospitals enable row level security;
alter table hospital_comments enable row level security;
