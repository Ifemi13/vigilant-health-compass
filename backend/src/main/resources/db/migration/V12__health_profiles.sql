-- General → Health Profile: one per user, entered by the user.
create table health_profiles (
    user_id             uuid primary key, -- Supabase auth user id (JWT "sub")
    age                 smallint    not null check (age between 0 and 120),
    sex                 text        not null check (sex in ('FEMALE', 'MALE', 'INTERSEX', 'PREFER_NOT_TO_SAY')),
    current_conditions  text        not null check (char_length(current_conditions) between 1 and 2000),
    vaccination_history text check (char_length(vaccination_history) <= 2000),
    family_history      text check (char_length(family_history) <= 2000),
    updated_at          timestamptz not null default now()
);

-- See V1: blocks the anon key from reading these via Supabase's REST API.
alter table health_profiles enable row level security;
