-- Specialty hospitals listed on each General → Awareness disease page, and a comment forum per hospital.

create table specialty_hospitals (
    id          uuid primary key,
    topic_id    text not null, -- the Awareness topic slug, e.g. 'diabetes' (frontend content/awarenessTopics.ts)
    name        text not null,
    specialty   text not null,
    address     text not null,
    city        text not null,
    state       text not null,
    postal_code text,
    phone       text,
    website     text,
    description text
);

create index specialty_hospitals_topic_idx on specialty_hospitals (topic_id);

create table hospital_comments (
    id          uuid primary key default gen_random_uuid(),
    hospital_id uuid        not null references specialty_hospitals (id) on delete cascade,
    author_id   uuid        not null, -- Supabase auth user id; never returned by the API
    author_name text        not null, -- anonymized nickname shown instead of the author's identity
    author_role text        not null check (author_role in ('PATIENT', 'PHYSICIAN')),
    body        text        not null check (char_length(body) between 1 and 2000),
    created_at  timestamptz not null default now()
);

create index hospital_comments_hospital_idx on hospital_comments (hospital_id, created_at desc);

-- See V1: blocks the anon key from reading these via Supabase's REST API.
alter table specialty_hospitals enable row level security;
alter table hospital_comments enable row level security;
