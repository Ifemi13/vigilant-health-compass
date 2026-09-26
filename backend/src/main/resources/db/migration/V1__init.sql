-- profiles.id is the Supabase auth user id (the JWT "sub" claim). There is no FK to
-- auth.users so this migration also runs on plain Postgres (e.g. Testcontainers).
create table profiles (
    id         uuid primary key,
    role       text        not null check (role in ('GUARDIAN', 'VET')),
    email      text        not null,
    created_at timestamptz not null default now()
);

create table guardian_profiles (
    user_id uuid primary key references profiles (id) on delete cascade,
    phone   text not null
);

create table vet_profiles (
    user_id     uuid primary key references profiles (id) on delete cascade,
    clinic_name text not null,
    address     text not null,
    email       text not null -- clinic contact email, may differ from the login email
);

create table pets (
    id                  uuid primary key default gen_random_uuid(),
    guardian_id         uuid        not null references guardian_profiles (user_id) on delete cascade,
    name                text        not null,
    species             text        not null,
    breed               text,
    sex                 text        not null check (sex in ('MALE', 'FEMALE', 'UNKNOWN')),
    neutered            boolean     not null default false,
    birth_date          date,
    weight_kg           numeric(6, 2),
    health_history      text,
    vaccination_history text,
    allergies           text,
    created_at          timestamptz not null default now()
);

create index pets_guardian_id_idx on pets (guardian_id);

-- Spring connects as the table owner, which bypasses RLS. Enabling RLS with no
-- policies stops the public anon key from reading these tables via Supabase's REST API.
alter table profiles enable row level security;
alter table guardian_profiles enable row level security;
alter table vet_profiles enable row level security;
alter table pets enable row level security;
