-- General → Healthcare Near Me: community health centers (HRSA) and ZIP / city centers (Census) used to turn
-- a searched location into coordinates. Hospitals get coordinates too (approximate: their ZIP or city center).
-- Data is loaded by V14.

create table zip_centers (
    zip       text primary key,
    latitude  double precision not null,
    longitude double precision not null
);

create table place_centers (
    id        serial primary key,
    name      text             not null, -- e.g. 'Madison' (legal suffix like "city" removed)
    kind      text             not null, -- 'city', 'village' or 'CDP'
    state     text             not null,
    latitude  double precision not null,
    longitude double precision not null
);

create index place_centers_name_idx on place_centers (lower(name));

create table community_health_centers (
    id                 uuid primary key,
    hrsa_site_id       text             not null unique, -- BPHC assigned number
    name               text             not null,
    organization       text             not null,
    address            text             not null,
    city               text             not null,
    state              text             not null,
    postal_code        text,
    phone              text,
    website            text,
    health_center_type text             not null, -- FQHC or FQHC Look-Alike
    latitude           double precision not null,
    longitude          double precision not null
);

alter table hospitals
    add column latitude  double precision,
    add column longitude double precision,
    add column location_approximate boolean not null default true; -- true: ZIP/city center, not the building

-- See V1: blocks the anon key from reading these via Supabase's REST API.
alter table zip_centers enable row level security;
alter table place_centers enable row level security;
alter table community_health_centers enable row level security;
