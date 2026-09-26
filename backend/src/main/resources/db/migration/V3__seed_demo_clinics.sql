-- Demo data: fictional clinics (no real businesses) so clinic search works out of the box.
-- Phone numbers use the reserved 555-01xx range and emails/websites use the .example domain.
-- Delete these rows in a later migration before loading real clinic data.

insert into clinics (id, name, address_line, city, state, postal_code, phone, email, website) values
-- Madison, WI
('00000000-0000-4000-8000-000000000001', 'Lakeside Paws Veterinary Clinic', '412 Willow Bend Rd',   'Madison', 'WI', '53703', '(608) 555-0101', 'hello@lakesidepaws.example',   'https://lakesidepaws.example'),
('00000000-0000-4000-8000-000000000002', 'Isthmus Animal Hospital',         '88 Capitol View Ave',  'Madison', 'WI', '53703', '(608) 555-0102', 'care@isthmusvet.example',      'https://isthmusvet.example'),
('00000000-0000-4000-8000-000000000003', 'Badger Pet Care Center',          '1520 Prairie Loop',    'Madison', 'WI', '53704', '(608) 555-0103', 'frontdesk@badgerpet.example',  'https://badgerpet.example'),
('00000000-0000-4000-8000-000000000004', 'Westside Companion Vets',         '7301 Meadow Ridge Dr', 'Madison', 'WI', '53719', '(608) 555-0104', 'info@westsidecompanion.example', 'https://westsidecompanion.example'),
('00000000-0000-4000-8000-000000000005', 'Monona Bay Animal Clinic',        '245 Harbor Point Way', 'Madison', 'WI', '53713', '(608) 555-0105', 'appointments@mononabay.example', 'https://mononabay.example'),
('00000000-0000-4000-8000-000000000006', 'University Heights Pet Hospital', '930 Campus Hill Rd',   'Madison', 'WI', '53705', '(608) 555-0106', 'hello@uheightspet.example',    'https://uheightspet.example'),
('00000000-0000-4000-8000-000000000007', 'Four Lakes Low-Cost Vet',         '3310 Cedar Grove Ln',  'Madison', 'WI', '53714', '(608) 555-0107', 'help@fourlakesvet.example',    'https://fourlakesvet.example'),
('00000000-0000-4000-8000-000000000008', 'Hilldale Veterinary Emergency',   '5102 Summit Crest Ave','Madison', 'WI', '53711', '(608) 555-0108', 'er@hilldalevet.example',       'https://hilldalevet.example'),
-- Milwaukee, WI
('00000000-0000-4000-8000-000000000009', 'Third Ward Animal Clinic',        '301 Foundry Row',      'Milwaukee', 'WI', '53202', '(414) 555-0109', 'hello@thirdwardvet.example',  'https://thirdwardvet.example'),
('00000000-0000-4000-8000-000000000010', 'Bay View Pet Wellness',           '2718 Lighthouse Ave',  'Milwaukee', 'WI', '53207', '(414) 555-0110', 'care@bayviewpet.example',     'https://bayviewpet.example'),
('00000000-0000-4000-8000-000000000011', 'Riverwest Community Vet',         '815 Millrace St',      'Milwaukee', 'WI', '53212', '(414) 555-0111', 'info@riverwestvet.example',   'https://riverwestvet.example'),
('00000000-0000-4000-8000-000000000012', 'Eastside Paws & Claws',           '1944 Bluff View Dr',   'Milwaukee', 'WI', '53211', '(414) 555-0112', 'desk@eastsidepaws.example',   'https://eastsidepaws.example'),
('00000000-0000-4000-8000-000000000013', 'Walker''s Point Animal Hospital', '620 Tannery Ct',       'Milwaukee', 'WI', '53204', '(414) 555-0113', 'hello@walkerspointvet.example', 'https://walkerspointvet.example'),
('00000000-0000-4000-8000-000000000014', 'Southside Affordable Pet Clinic', '3805 Orchard Park Rd', 'Milwaukee', 'WI', '53215', '(414) 555-0114', 'help@southsidepet.example',   'https://southsidepet.example'),
-- Chicago, IL
('00000000-0000-4000-8000-000000000015', 'Lincoln Park Pet Hospital',       '2240 Garden Walk',     'Chicago', 'IL', '60614', '(312) 555-0115', 'care@lpphospital.example',     'https://lpphospital.example'),
('00000000-0000-4000-8000-000000000016', 'Wicker Park Animal Care',         '1580 Brickyard Ln',    'Chicago', 'IL', '60622', '(312) 555-0116', 'hello@wickerparkvet.example',  'https://wickerparkvet.example'),
('00000000-0000-4000-8000-000000000017', 'Uptown Low-Cost Vet Clinic',      '4712 Lakeshore Terrace','Chicago', 'IL', '60640', '(312) 555-0117', 'info@uptownvet.example',       'https://uptownvet.example'),
-- Minneapolis, MN
('00000000-0000-4000-8000-000000000018', 'North Loop Veterinary',           '410 Warehouse Sq',     'Minneapolis', 'MN', '55401', '(612) 555-0118', 'hello@northloopvet.example', 'https://northloopvet.example'),
('00000000-0000-4000-8000-000000000019', 'Longfellow Pet Clinic',           '3620 River Bluff Ave', 'Minneapolis', 'MN', '55406', '(612) 555-0119', 'care@longfellowpet.example', 'https://longfellowpet.example'),
('00000000-0000-4000-8000-000000000020', 'Uptown Lakes Animal Hospital',    '2915 Chain of Lakes Dr','Minneapolis', 'MN', '55408', '(612) 555-0120', 'desk@uptownlakes.example',  'https://uptownlakes.example');

insert into clinic_services (clinic_id, service, price) values
('00000000-0000-4000-8000-000000000001', 'EXAM', 62.00),
('00000000-0000-4000-8000-000000000001', 'VACCINATION', 32.00),
('00000000-0000-4000-8000-000000000001', 'SPAY_NEUTER', 320.00),
('00000000-0000-4000-8000-000000000001', 'DENTAL', 480.00),

('00000000-0000-4000-8000-000000000002', 'EXAM', 85.00),
('00000000-0000-4000-8000-000000000002', 'VACCINATION', 45.00),
('00000000-0000-4000-8000-000000000002', 'SPAY_NEUTER', 450.00),
('00000000-0000-4000-8000-000000000002', 'DENTAL', 720.00),
('00000000-0000-4000-8000-000000000002', 'EMERGENCY', 250.00),

('00000000-0000-4000-8000-000000000003', 'EXAM', 55.00),
('00000000-0000-4000-8000-000000000003', 'VACCINATION', 28.00),
('00000000-0000-4000-8000-000000000003', 'SPAY_NEUTER', 275.00),

('00000000-0000-4000-8000-000000000004', 'EXAM', 78.00),
('00000000-0000-4000-8000-000000000004', 'VACCINATION', 40.00),
('00000000-0000-4000-8000-000000000004', 'DENTAL', 610.00),
('00000000-0000-4000-8000-000000000004', 'SPAY_NEUTER', 395.00),

('00000000-0000-4000-8000-000000000005', 'EXAM', 68.00),
('00000000-0000-4000-8000-000000000005', 'VACCINATION', 35.00),
('00000000-0000-4000-8000-000000000005', 'DENTAL', 525.00),

('00000000-0000-4000-8000-000000000006', 'EXAM', 92.00),
('00000000-0000-4000-8000-000000000006', 'VACCINATION', 55.00),
('00000000-0000-4000-8000-000000000006', 'SPAY_NEUTER', 560.00),
('00000000-0000-4000-8000-000000000006', 'DENTAL', 850.00),

('00000000-0000-4000-8000-000000000007', 'EXAM', 45.00),
('00000000-0000-4000-8000-000000000007', 'VACCINATION', 20.00),
('00000000-0000-4000-8000-000000000007', 'SPAY_NEUTER', 150.00),
('00000000-0000-4000-8000-000000000007', 'DENTAL', 290.00),

('00000000-0000-4000-8000-000000000008', 'EXAM', 95.00),
('00000000-0000-4000-8000-000000000008', 'EMERGENCY', 180.00),
('00000000-0000-4000-8000-000000000008', 'VACCINATION', 50.00),

('00000000-0000-4000-8000-000000000009', 'EXAM', 88.00),
('00000000-0000-4000-8000-000000000009', 'VACCINATION', 48.00),
('00000000-0000-4000-8000-000000000009', 'DENTAL', 790.00),
('00000000-0000-4000-8000-000000000009', 'SPAY_NEUTER', 480.00),

('00000000-0000-4000-8000-000000000010', 'EXAM', 65.00),
('00000000-0000-4000-8000-000000000010', 'VACCINATION', 34.00),
('00000000-0000-4000-8000-000000000010', 'SPAY_NEUTER', 340.00),

('00000000-0000-4000-8000-000000000011', 'EXAM', 50.00),
('00000000-0000-4000-8000-000000000011', 'VACCINATION', 25.00),
('00000000-0000-4000-8000-000000000011', 'SPAY_NEUTER', 210.00),
('00000000-0000-4000-8000-000000000011', 'DENTAL', 350.00),

('00000000-0000-4000-8000-000000000012', 'EXAM', 74.00),
('00000000-0000-4000-8000-000000000012', 'VACCINATION', 38.00),
('00000000-0000-4000-8000-000000000012', 'DENTAL', 575.00),
('00000000-0000-4000-8000-000000000012', 'EMERGENCY', 220.00),

('00000000-0000-4000-8000-000000000013', 'EXAM', 70.00),
('00000000-0000-4000-8000-000000000013', 'VACCINATION', 36.00),
('00000000-0000-4000-8000-000000000013', 'SPAY_NEUTER', 365.00),
('00000000-0000-4000-8000-000000000013', 'EMERGENCY', 195.00),

('00000000-0000-4000-8000-000000000014', 'EXAM', 48.00),
('00000000-0000-4000-8000-000000000014', 'VACCINATION', 22.00),
('00000000-0000-4000-8000-000000000014', 'SPAY_NEUTER', 175.00),

('00000000-0000-4000-8000-000000000015', 'EXAM', 95.00),
('00000000-0000-4000-8000-000000000015', 'VACCINATION', 60.00),
('00000000-0000-4000-8000-000000000015', 'SPAY_NEUTER', 600.00),
('00000000-0000-4000-8000-000000000015', 'DENTAL', 900.00),
('00000000-0000-4000-8000-000000000015', 'EMERGENCY', 300.00),

('00000000-0000-4000-8000-000000000016', 'EXAM', 82.00),
('00000000-0000-4000-8000-000000000016', 'VACCINATION', 44.00),
('00000000-0000-4000-8000-000000000016', 'DENTAL', 680.00),

('00000000-0000-4000-8000-000000000017', 'EXAM', 52.00),
('00000000-0000-4000-8000-000000000017', 'VACCINATION', 24.00),
('00000000-0000-4000-8000-000000000017', 'SPAY_NEUTER', 190.00),
('00000000-0000-4000-8000-000000000017', 'EMERGENCY', 120.00),

('00000000-0000-4000-8000-000000000018', 'EXAM', 79.00),
('00000000-0000-4000-8000-000000000018', 'VACCINATION', 42.00),
('00000000-0000-4000-8000-000000000018', 'SPAY_NEUTER', 420.00),
('00000000-0000-4000-8000-000000000018', 'DENTAL', 640.00),

('00000000-0000-4000-8000-000000000019', 'EXAM', 58.00),
('00000000-0000-4000-8000-000000000019', 'VACCINATION', 30.00),
('00000000-0000-4000-8000-000000000019', 'SPAY_NEUTER', 260.00),

('00000000-0000-4000-8000-000000000020', 'EXAM', 86.00),
('00000000-0000-4000-8000-000000000020', 'VACCINATION', 46.00),
('00000000-0000-4000-8000-000000000020', 'DENTAL', 740.00),
('00000000-0000-4000-8000-000000000020', 'EMERGENCY', 240.00);
