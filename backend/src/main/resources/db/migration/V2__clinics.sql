create table clinics (
    id           uuid primary key default gen_random_uuid(),
    name         text        not null,
    address_line text        not null,
    city         text        not null,
    state        text        not null, -- 2-letter code, e.g. WI
    postal_code  text        not null,
    phone        text,
    email        text,
    website      text,
    created_at   timestamptz not null default now()
);

create index clinics_city_idx on clinics (lower(city));
create index clinics_postal_code_idx on clinics (postal_code);

-- Typical price (USD) a clinic charges for each service it offers.
create table clinic_services (
    clinic_id uuid          not null references clinics (id) on delete cascade,
    service   text          not null check (service in ('EXAM', 'VACCINATION', 'SPAY_NEUTER', 'DENTAL', 'EMERGENCY')),
    price     numeric(8, 2) not null check (price >= 0),
    primary key (clinic_id, service)
);

create index clinic_services_service_price_idx on clinic_services (service, price);

-- See V1: blocks the anon key from reading these via Supabase's REST API.
alter table clinics enable row level security;
alter table clinic_services enable row level security;
