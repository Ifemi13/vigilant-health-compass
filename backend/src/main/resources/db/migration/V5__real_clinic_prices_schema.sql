-- Replaces the demo clinic model (V2–V4: one price per clinic per fixed service) with the shape of the
-- real Wisconsin data (wi_vet_costs.json): prices are per species, use each clinic's own service names,
-- and link to a standard procedure that carries statewide / national averages. Data is loaded by V6.

drop table clinic_services;
drop table clinics;

-- One row per clinic location, e.g. "Wisconsin Humane Society - Kenosha Campus".
create table clinics (
    id            uuid primary key,
    organization  text        not null,
    name          text        not null,
    provider_type text        not null, -- e.g. 'shelter clinic', 'corporate chain'
    address       text,                 -- full street address as posted; null when not published
    city          text        not null,
    state         text        not null,
    postal_code   text,
    eligibility   text,                 -- who can use the clinic, as posted
    source_url    text,                 -- where the prices were found
    created_at    timestamptz not null default now()
);

create index clinics_city_idx on clinics (lower(city));
create index clinics_postal_code_idx on clinics (postal_code);

-- A standard procedure for one species, with reference prices.
create table procedures (
    id          text primary key, -- e.g. 'dog-rabies-1-year'
    species     text          not null check (species in ('dog', 'cat')),
    category    text          not null, -- e.g. 'vaccine', 'lab test', 'imaging'
    name        text          not null,
    avg_price   numeric(8, 2),          -- best available average (see avg_basis); null when no data
    avg_basis   text          not null, -- where avg_price came from
    us_avg      numeric(8, 2),          -- U.S. (national) average, when known
    posted_n    integer       not null default 0, -- number of Wisconsin clinics posting a price
    posted_min  numeric(8, 2),
    posted_mean numeric(8, 2),
    posted_max  numeric(8, 2)
);

-- A price a clinic posted for one service for one species.
create table clinic_prices (
    id           uuid primary key default gen_random_uuid(),
    clinic_id    uuid          not null references clinics (id) on delete cascade,
    species      text          not null check (species in ('dog', 'cat')),
    category     text          not null,
    service      text          not null, -- the clinic's own name for it
    price        numeric(8, 2) not null check (price >= 0),
    price_high   numeric(8, 2) not null check (price_high >= price), -- = price unless a range was posted
    procedure_id text references procedures (id), -- null when it matches no standard procedure
    note         text,
    price_as_of  date,
    date_checked date          not null,
    unique (clinic_id, species, service)
);

create index clinic_prices_procedure_idx on clinic_prices (procedure_id, price);

-- See V1: blocks the anon key from reading these via Supabase's REST API.
alter table clinics enable row level security;
alter table procedures enable row level security;
alter table clinic_prices enable row level security;
