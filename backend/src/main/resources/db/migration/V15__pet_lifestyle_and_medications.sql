-- Pets → Pet Health Profile: lifestyle and current medications. All optional, so existing pets stay valid.
alter table pets
    add column environment    text check (environment in ('INDOOR', 'OUTDOOR', 'BOTH')),
    add column activity_level text check (activity_level in ('LOW', 'MODERATE', 'HIGH')),
    add column medications    text check (char_length(medications) <= 2000);
