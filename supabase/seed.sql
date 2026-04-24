-- Univentra sample data
-- Run this after schema.sql.

begin;

with seed_users (id, email, password, role_name, full_name, department, year_of_study, favorite_category) as (
  values
    ('00000000-0000-4000-8000-000000000001'::uuid, 'admin@univentra.edu', 'Admin@123', 'admin', 'Anjali Maurya', 'Student Affairs', null, 'Leadership'),
    ('00000000-0000-4000-8000-000000000010'::uuid, 'adarsh.patel@univentra.edu', 'Organizer@123', 'organizer', 'Adarsh Patel', 'Computer Science', 'Final Year', 'Technology'),
    ('00000000-0000-4000-8000-000000000011'::uuid, 'kabir.singh@univentra.edu', 'Organizer@123', 'organizer', 'Kabir Singh', 'Mass Communication', 'Third Year', 'Cultural'),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'priya.sharma@univentra.edu', 'Student@123', 'student', 'Priya Sharma', 'Computer Science', 'Third Year', 'Technology'),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'rohan.verma@univentra.edu', 'Student@123', 'student', 'Rohan Verma', 'Electronics', 'Second Year', 'Sports'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'ananya.patel@univentra.edu', 'Student@123', 'student', 'Ananya Patel', 'Business Administration', 'Third Year', 'Entrepreneurship'),
    ('00000000-0000-4000-8000-000000000104'::uuid, 'meera.iyer@univentra.edu', 'Student@123', 'student', 'Meera Iyer', 'Architecture', 'Second Year', 'Cultural'),
    ('00000000-0000-4000-8000-000000000105'::uuid, 'dev.malhotra@univentra.edu', 'Student@123', 'student', 'Dev Malhotra', 'Mechanical', 'Third Year', 'Sports'),
    ('00000000-0000-4000-8000-000000000106'::uuid, 'sanya.bose@univentra.edu', 'Student@123', 'student', 'Sanya Bose', 'English', 'Second Year', 'Music'),
    ('00000000-0000-4000-8000-000000000107'::uuid, 'arjun.nair@univentra.edu', 'Student@123', 'student', 'Arjun Nair', 'Data Science', 'Second Year', 'Technology'),
    ('00000000-0000-4000-8000-000000000108'::uuid, 'kriti.gupta@univentra.edu', 'Student@123', 'student', 'Kriti Gupta', 'Law', 'Third Year', 'Leadership'),
    ('00000000-0000-4000-8000-000000000109'::uuid, 'neil.dsouza@univentra.edu', 'Student@123', 'student', 'Neil Dsouza', 'Design', 'Second Year', 'Photography'),
    ('00000000-0000-4000-8000-000000000110'::uuid, 'tara.kaur@univentra.edu', 'Student@123', 'student', 'Tara Kaur', 'Biotech', 'First Year', 'Workshops'),
    ('00000000-0000-4000-8000-000000000111'::uuid, 'rahul.jain@univentra.edu', 'Student@123', 'student', 'Rahul Jain', 'Physics', 'Second Year', 'Technology'),
    ('00000000-0000-4000-8000-000000000112'::uuid, 'nisha.yadav@univentra.edu', 'Student@123', 'student', 'Nisha Yadav', 'Economics', 'Third Year', 'Cultural'),
    ('00000000-0000-4000-8000-000000000113'::uuid, 'farhan.ali@univentra.edu', 'Student@123', 'student', 'Farhan Ali', 'Statistics', 'Second Year', 'Sports'),
    ('00000000-0000-4000-8000-000000000114'::uuid, 'lavanya.menon@univentra.edu', 'Student@123', 'student', 'Lavanya Menon', 'Media Studies', 'Third Year', 'Music')
)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  id,
  'authenticated',
  'authenticated',
  email,
  crypt(password, gen_salt('bf')),
  now(),
  jsonb_build_object('provider', 'email', 'providers', array['email']),
  jsonb_build_object(
    'full_name', full_name,
    'role', role_name,
    'department', department,
    'year_of_study', year_of_study,
    'favorite_category', favorite_category
  ),
  now(),
  now(),
  '',
  '',
  '',
  ''
from seed_users
on conflict (id) do nothing;

with seed_users (id, email) as (
  values
    ('00000000-0000-4000-8000-000000000001'::uuid, 'admin@univentra.edu'),
    ('00000000-0000-4000-8000-000000000010'::uuid, 'adarsh.patel@univentra.edu'),
    ('00000000-0000-4000-8000-000000000011'::uuid, 'kabir.singh@univentra.edu'),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'priya.sharma@univentra.edu'),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'rohan.verma@univentra.edu'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'ananya.patel@univentra.edu'),
    ('00000000-0000-4000-8000-000000000104'::uuid, 'meera.iyer@univentra.edu'),
    ('00000000-0000-4000-8000-000000000105'::uuid, 'dev.malhotra@univentra.edu'),
    ('00000000-0000-4000-8000-000000000106'::uuid, 'sanya.bose@univentra.edu'),
    ('00000000-0000-4000-8000-000000000107'::uuid, 'arjun.nair@univentra.edu'),
    ('00000000-0000-4000-8000-000000000108'::uuid, 'kriti.gupta@univentra.edu'),
    ('00000000-0000-4000-8000-000000000109'::uuid, 'neil.dsouza@univentra.edu'),
    ('00000000-0000-4000-8000-000000000110'::uuid, 'tara.kaur@univentra.edu'),
    ('00000000-0000-4000-8000-000000000111'::uuid, 'rahul.jain@univentra.edu'),
    ('00000000-0000-4000-8000-000000000112'::uuid, 'nisha.yadav@univentra.edu'),
    ('00000000-0000-4000-8000-000000000113'::uuid, 'farhan.ali@univentra.edu'),
    ('00000000-0000-4000-8000-000000000114'::uuid, 'lavanya.menon@univentra.edu')
)
insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  id,
  jsonb_build_object('sub', id::text, 'email', email),
  'email',
  id::text,
  now(),
  now(),
  now()
from seed_users
on conflict (provider, provider_id) do nothing;

update public.profiles p
set
  full_name = s.full_name,
  role = s.role_name,
  department = s.department,
  year_of_study = s.year_of_study,
  bio = s.bio,
  favorite_category = s.favorite_category,
  interests = s.interests,
  member_since = now() - s.member_offset,
  participation_rate = s.participation_rate,
  total_hours = s.total_hours,
  total_xp = s.total_xp
from (
  values
    ('00000000-0000-4000-8000-000000000001'::uuid, 'Anjali Maurya', 'admin', 'Student Affairs', null, 'Campus engagement lead powering every big student moment.', 'Leadership', array['Leadership', 'Operations'], interval '16 months', 98::numeric, 122::numeric, 980),
    ('00000000-0000-4000-8000-000000000010'::uuid, 'Adarsh Patel', 'organizer', 'Computer Science', 'Final Year', 'President of Innovators Guild and product sprint host.', 'Technology', array['Technology', 'Workshops'], interval '20 months', 92::numeric, 81::numeric, 860),
    ('00000000-0000-4000-8000-000000000011'::uuid, 'Kabir Singh', 'organizer', 'Mass Communication', 'Third Year', 'Cultural curator and emcee for the biggest campus celebrations.', 'Cultural', array['Cultural', 'Music'], interval '18 months', 88::numeric, 76::numeric, 810),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Priya Sharma', 'student', 'Computer Science', 'Third Year', 'Hackathon lover, club collaborator, and campus builder.', 'Technology', array['Technology', 'Workshops', 'Entrepreneurship'], interval '24 months', 94::numeric, 67::numeric, 1320),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'Rohan Verma', 'student', 'Electronics', 'Second Year', 'Robotics lab volunteer and football regular.', 'Sports', array['Sports', 'Technology'], interval '22 months', 90::numeric, 61::numeric, 1210),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Ananya Patel', 'student', 'Business Administration', 'Third Year', 'Pitch deck perfectionist and founder community regular.', 'Entrepreneurship', array['Entrepreneurship', 'Leadership', 'Workshops'], interval '20 months', 86::numeric, 57::numeric, 1080),
    ('00000000-0000-4000-8000-000000000104'::uuid, 'Meera Iyer', 'student', 'Architecture', 'Second Year', 'Culture-first student curator and showcase volunteer.', 'Cultural', array['Cultural', 'Design'], interval '18 months', 84::numeric, 49::numeric, 760),
    ('00000000-0000-4000-8000-000000000105'::uuid, 'Dev Malhotra', 'student', 'Mechanical', 'Third Year', 'Sports organizer and competition regular.', 'Sports', array['Sports', 'Technology'], interval '17 months', 82::numeric, 46::numeric, 705),
    ('00000000-0000-4000-8000-000000000106'::uuid, 'Sanya Bose', 'student', 'English', 'Second Year', 'Stagecraft vocalist and cultural storyteller.', 'Music', array['Music', 'Cultural'], interval '16 months', 81::numeric, 44::numeric, 690),
    ('00000000-0000-4000-8000-000000000107'::uuid, 'Arjun Nair', 'student', 'Data Science', 'Second Year', 'AI workshop enthusiast and sprint participant.', 'Technology', array['Technology', 'Workshops'], interval '15 months', 80::numeric, 39::numeric, 640),
    ('00000000-0000-4000-8000-000000000108'::uuid, 'Kriti Gupta', 'student', 'Law', 'Third Year', 'Leadership council volunteer focused on campus advocacy.', 'Leadership', array['Leadership', 'Debate'], interval '14 months', 78::numeric, 37::numeric, 610),
    ('00000000-0000-4000-8000-000000000109'::uuid, 'Neil Dsouza', 'student', 'Design', 'Second Year', 'Visual storyteller who documents the best campus moments.', 'Photography', array['Photography', 'Cultural'], interval '13 months', 77::numeric, 32::numeric, 560),
    ('00000000-0000-4000-8000-000000000110'::uuid, 'Tara Kaur', 'student', 'Biotech', 'First Year', 'Curious workshop attendee building her campus footprint.', 'Workshops', array['Workshops', 'Leadership'], interval '12 months', 74::numeric, 29::numeric, 520),
    ('00000000-0000-4000-8000-000000000111'::uuid, 'Rahul Jain', 'student', 'Physics', 'Second Year', 'Builds product ideas and joins every tech sprint.', 'Technology', array['Technology', 'Entrepreneurship'], interval '11 months', 72::numeric, 25::numeric, 480),
    ('00000000-0000-4000-8000-000000000112'::uuid, 'Nisha Yadav', 'student', 'Economics', 'Third Year', 'Cultural volunteer with a soft spot for stage shows.', 'Cultural', array['Cultural', 'Music'], interval '11 months', 70::numeric, 23::numeric, 450),
    ('00000000-0000-4000-8000-000000000113'::uuid, 'Farhan Ali', 'student', 'Statistics', 'Second Year', 'Sports analytics enthusiast and match-day volunteer.', 'Sports', array['Sports', 'Leadership'], interval '10 months', 69::numeric, 20::numeric, 420),
    ('00000000-0000-4000-8000-000000000114'::uuid, 'Lavanya Menon', 'student', 'Media Studies', 'Third Year', 'Music and live-stage content creator for campus experiences.', 'Music', array['Music', 'Photography'], interval '9 months', 68::numeric, 18::numeric, 390)
) as s(id, full_name, role_name, department, year_of_study, bio, favorite_category, interests, member_offset, participation_rate, total_hours, total_xp)
where p.id = s.id;

insert into public.badges (id, name, description, icon, criteria_type, criteria_value, badge_color)
values
  ('30000000-0000-4000-8000-000000000001'::uuid, 'Campus Explorer', 'Joined 3 events across campus', 'Compass', 'events_attended', 3, '#1F7DFF'),
  ('30000000-0000-4000-8000-000000000002'::uuid, 'Rising Star', 'Crossed 500 XP and maintained momentum', 'Sparkles', 'xp_total', 500, '#FFB800'),
  ('30000000-0000-4000-8000-000000000003'::uuid, 'Club Hopper', 'Joined at least 2 active clubs', 'Users', 'clubs_joined', 2, '#7A4DFF'),
  ('30000000-0000-4000-8000-000000000004'::uuid, 'Spotlight Performer', 'Attended 6 events successfully', 'Award', 'events_attended', 6, '#FF4DBA'),
  ('30000000-0000-4000-8000-000000000005'::uuid, 'Campus Champion', 'Crossed 1000 XP on campus', 'Trophy', 'xp_total', 1000, '#0FA968')
on conflict (id) do nothing;

insert into public.clubs (id, name, slug, description, category, created_by, is_active)
values
  ('10000000-0000-4000-8000-000000000001'::uuid, 'Innovators Guild', 'innovators-guild', 'A cross-campus innovation club hosting hackathons, product sprints, and AI build weeks.', 'Technology', '00000000-0000-4000-8000-000000000010'::uuid, true),
  ('10000000-0000-4000-8000-000000000002'::uuid, 'Kaleidoscope Collective', 'kaleidoscope-collective', 'Culture-first student community delivering festivals, dance shows, and creative showcases.', 'Cultural', '00000000-0000-4000-8000-000000000011'::uuid, true),
  ('10000000-0000-4000-8000-000000000003'::uuid, 'Campus Strikers', 'campus-strikers', 'Sports league makers running football, athletics, and endurance events.', 'Sports', '00000000-0000-4000-8000-000000000105'::uuid, true),
  ('10000000-0000-4000-8000-000000000004'::uuid, 'Stagecraft Society', 'stagecraft-society', 'Music, performances, and live-stage production community.', 'Music', '00000000-0000-4000-8000-000000000106'::uuid, true),
  ('10000000-0000-4000-8000-000000000005'::uuid, 'Ignite Launchpad', 'ignite-launchpad', 'Startup, business, and leadership community supporting idea-to-demo journeys.', 'Entrepreneurship', '00000000-0000-4000-8000-000000000103'::uuid, true)
on conflict (id) do nothing;

insert into public.club_members (club_id, user_id, role_in_club, joined_at, is_active)
values
  ('10000000-0000-4000-8000-000000000001'::uuid, '00000000-0000-4000-8000-000000000010'::uuid, 'president', now() - interval '14 months', true),
  ('10000000-0000-4000-8000-000000000001'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, 'coordinator', now() - interval '12 months', true),
  ('10000000-0000-4000-8000-000000000001'::uuid, '00000000-0000-4000-8000-000000000107'::uuid, 'member', now() - interval '9 months', true),
  ('10000000-0000-4000-8000-000000000001'::uuid, '00000000-0000-4000-8000-000000000111'::uuid, 'member', now() - interval '8 months', true),
  ('10000000-0000-4000-8000-000000000002'::uuid, '00000000-0000-4000-8000-000000000011'::uuid, 'president', now() - interval '13 months', true),
  ('10000000-0000-4000-8000-000000000002'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, 'coordinator', now() - interval '11 months', true),
  ('10000000-0000-4000-8000-000000000002'::uuid, '00000000-0000-4000-8000-000000000112'::uuid, 'member', now() - interval '10 months', true),
  ('10000000-0000-4000-8000-000000000003'::uuid, '00000000-0000-4000-8000-000000000105'::uuid, 'president', now() - interval '12 months', true),
  ('10000000-0000-4000-8000-000000000003'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, 'coordinator', now() - interval '10 months', true),
  ('10000000-0000-4000-8000-000000000003'::uuid, '00000000-0000-4000-8000-000000000113'::uuid, 'member', now() - interval '8 months', true),
  ('10000000-0000-4000-8000-000000000004'::uuid, '00000000-0000-4000-8000-000000000106'::uuid, 'president', now() - interval '12 months', true),
  ('10000000-0000-4000-8000-000000000004'::uuid, '00000000-0000-4000-8000-000000000114'::uuid, 'member', now() - interval '7 months', true),
  ('10000000-0000-4000-8000-000000000005'::uuid, '00000000-0000-4000-8000-000000000103'::uuid, 'president', now() - interval '11 months', true),
  ('10000000-0000-4000-8000-000000000005'::uuid, '00000000-0000-4000-8000-000000000108'::uuid, 'coordinator', now() - interval '9 months', true),
  ('10000000-0000-4000-8000-000000000005'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, 'member', now() - interval '6 months', true)
on conflict (club_id, user_id) do nothing;

insert into public.events (
  id, title, slug, description, short_description, organizer_type, organizer_id, venue, mode, meeting_link,
  category, start_time, end_time, registration_deadline, max_participants, team_based, certificate_enabled,
  attendance_qr_enabled, status, xp_reward, created_by, approved_by
)
values
  ('20000000-0000-4000-8000-000000000001'::uuid, 'Tech Hackathon 2025', 'tech-hackathon-2025', 'A 24-hour campus innovation marathon for builders, designers, and storytellers with mentor checkpoints and a final showcase.', 'Build, pitch, and launch solutions in a 24-hour campus sprint.', 'club', '10000000-0000-4000-8000-000000000001'::uuid, 'Innovation Hub Atrium', 'offline', null, 'Technology', now() + interval '8 days', now() + interval '9 days 4 hours', now() + interval '5 days', 160, true, true, true, 'approved', 120, '00000000-0000-4000-8000-000000000010'::uuid, '00000000-0000-4000-8000-000000000001'::uuid),
  ('20000000-0000-4000-8000-000000000002'::uuid, 'Kaleidoscope Cultural Fest', 'kaleidoscope-cultural-fest', 'A bright all-day cultural celebration with dance crews, theater circles, design pop-ups, food lanes, and live student performances.', 'The annual culture-forward festival with performances, art, and community.', 'club', '10000000-0000-4000-8000-000000000002'::uuid, 'Open Air Theatre', 'offline', null, 'Cultural', now() + interval '18 days', now() + interval '18 days 10 hours', now() + interval '15 days', 400, false, true, true, 'approved', 90, '00000000-0000-4000-8000-000000000011'::uuid, '00000000-0000-4000-8000-000000000001'::uuid),
  ('20000000-0000-4000-8000-000000000003'::uuid, 'Inter-College Football Championship', 'inter-college-football-championship', 'Bring your team spirit for the biggest football face-off of the semester, featuring league tables and halftime entertainment.', 'Competitive football finals with crowds, commentary, and campus pride.', 'club', '10000000-0000-4000-8000-000000000003'::uuid, 'Main Sports Ground', 'offline', null, 'Sports', now() + interval '13 days', now() + interval '13 days 6 hours', now() + interval '10 days', 220, true, true, true, 'approved', 100, '00000000-0000-4000-8000-000000000105'::uuid, '00000000-0000-4000-8000-000000000001'::uuid),
  ('20000000-0000-4000-8000-000000000004'::uuid, 'AI Product Sprint Workshop', 'ai-product-sprint-workshop', 'Hands-on lab covering prompt systems, agent workflows, product framing, and lightning demo critiques with live mentors.', 'A rapid AI workshop focused on product thinking and hands-on builds.', 'club', '10000000-0000-4000-8000-000000000001'::uuid, 'Lab 4.02', 'hybrid', 'https://meet.example.com/univentra-ai', 'Workshops', now() + interval '4 days', now() + interval '4 days 3 hours', now() + interval '3 days', 80, false, true, true, 'approved', 75, '00000000-0000-4000-8000-000000000010'::uuid, '00000000-0000-4000-8000-000000000001'::uuid),
  ('20000000-0000-4000-8000-000000000005'::uuid, 'Moonlight Music Festival', 'moonlight-music-festival', 'An evening concert experience with bands, unplugged sessions, open-mic segments, and an ambient campus night market.', 'A campus evening of live music, lights, and open-stage energy.', 'club', '10000000-0000-4000-8000-000000000004'::uuid, 'Central Lawn', 'offline', null, 'Music', now() + interval '24 days', now() + interval '24 days 5 hours', now() + interval '22 days', 500, false, false, true, 'approved', 60, '00000000-0000-4000-8000-000000000106'::uuid, '00000000-0000-4000-8000-000000000001'::uuid),
  ('20000000-0000-4000-8000-000000000006'::uuid, 'Robotics Challenge Circuit', 'robotics-challenge-circuit', 'Prototype robots, obstacle runs, microcontroller showcases, and speed-build challenges led by makers across departments.', 'Compete in robotics trials with mentors, judges, and live scoring.', 'club', '10000000-0000-4000-8000-000000000001'::uuid, 'Engineering Workshop Bay', 'offline', null, 'Technology', now() + interval '35 days', now() + interval '35 days 7 hours', now() + interval '28 days', 90, true, true, true, 'approved', 95, '00000000-0000-4000-8000-000000000010'::uuid, '00000000-0000-4000-8000-000000000001'::uuid),
  ('20000000-0000-4000-8000-000000000007'::uuid, 'Startup Pitch Arena', 'startup-pitch-arena', 'Pitch decks, market sizing, founder feedback, and jury Q&A for student startups and idea-stage teams.', 'Present startup ideas to judges and get founder-grade feedback.', 'club', '10000000-0000-4000-8000-000000000005'::uuid, 'Business Incubator Hall', 'hybrid', 'https://meet.example.com/pitch-arena', 'Entrepreneurship', now() + interval '11 days', now() + interval '11 days 4 hours', now() + interval '8 days', 70, true, true, true, 'approved', 110, '00000000-0000-4000-8000-000000000103'::uuid, '00000000-0000-4000-8000-000000000001'::uuid),
  ('20000000-0000-4000-8000-000000000008'::uuid, 'Golden Hour Photography Walk', 'golden-hour-photography-walk', 'A guided campus photowalk focused on framing, portrait direction, and creative storytelling for beginners and enthusiasts.', 'Capture campus stories with mentors during a golden-hour photowalk.', 'admin', '00000000-0000-4000-8000-000000000001'::uuid, 'North Gate to Lake Walk', 'offline', null, 'Photography', now() + interval '16 days', now() + interval '16 days 2 hours', now() + interval '14 days', 45, false, true, true, 'approved', 55, '00000000-0000-4000-8000-000000000001'::uuid, '00000000-0000-4000-8000-000000000001'::uuid),
  ('20000000-0000-4000-8000-000000000009'::uuid, 'National Debate Championship', 'national-debate-championship', 'A structured debate tournament with prelims, adjudicator notes, and final rounds in front of invited panels.', 'Sharp arguments, curated rounds, and national-level campus debate energy.', 'admin', '00000000-0000-4000-8000-000000000001'::uuid, 'Seminar Hall B', 'offline', null, 'Leadership', now() + interval '28 days', now() + interval '28 days 9 hours', now() + interval '24 days', 120, true, true, true, 'approved', 85, '00000000-0000-4000-8000-000000000001'::uuid, '00000000-0000-4000-8000-000000000001'::uuid),
  ('20000000-0000-4000-8000-000000000010'::uuid, 'Cloud Native Bootcamp', 'cloud-native-bootcamp', 'Deploy, monitor, and demo lightweight cloud apps with guided labs and platform engineering best practices.', 'A practical build-and-deploy session for cloud-first student teams.', 'club', '10000000-0000-4000-8000-000000000001'::uuid, 'Virtual Lab + Innovation Hub', 'hybrid', 'https://meet.example.com/cloud-bootcamp', 'Workshops', now() - interval '9 days', now() - interval '9 days' + interval '4 hours', now() - interval '11 days', 65, false, true, true, 'completed', 80, '00000000-0000-4000-8000-000000000010'::uuid, '00000000-0000-4000-8000-000000000001'::uuid),
  ('20000000-0000-4000-8000-000000000011'::uuid, 'Street Dance Showdown', 'street-dance-showdown', 'High-energy crew battles, choreo rounds, and freestyle moments under festival lights.', 'Dance crews take the stage for a festival-style showdown.', 'club', '10000000-0000-4000-8000-000000000002'::uuid, 'Amphitheatre', 'offline', null, 'Cultural', now() - interval '18 days', now() - interval '18 days' + interval '4 hours', now() - interval '20 days', 140, true, true, true, 'completed', 70, '00000000-0000-4000-8000-000000000011'::uuid, '00000000-0000-4000-8000-000000000001'::uuid),
  ('20000000-0000-4000-8000-000000000012'::uuid, 'Eco Innovation Drive', 'eco-innovation-drive', 'An interdisciplinary sustainability sprint for teams exploring green prototypes, awareness concepts, and community ideas.', 'A campus sustainability sprint for builders, creatives, and changemakers.', 'admin', '00000000-0000-4000-8000-000000000001'::uuid, 'Sustainability Lab', 'offline', null, 'Workshops', now() + interval '42 days', now() + interval '42 days 5 hours', now() + interval '35 days', 60, true, true, true, 'pending', 85, '00000000-0000-4000-8000-000000000001'::uuid, null)
on conflict (id) do nothing;

insert into public.teams (id, event_id, team_name, leader_id, max_members)
values
  ('40000000-0000-4000-8000-000000000001'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 'Alpha Loop', '00000000-0000-4000-8000-000000000101'::uuid, 5),
  ('40000000-0000-4000-8000-000000000002'::uuid, '20000000-0000-4000-8000-000000000003'::uuid, 'North Block FC', '00000000-0000-4000-8000-000000000102'::uuid, 11)
on conflict (id) do nothing;

insert into public.team_members (team_id, user_id)
values
  ('40000000-0000-4000-8000-000000000001'::uuid, '00000000-0000-4000-8000-000000000101'::uuid),
  ('40000000-0000-4000-8000-000000000002'::uuid, '00000000-0000-4000-8000-000000000102'::uuid)
on conflict (team_id, user_id) do nothing;

insert into public.event_registrations (id, event_id, user_id, registration_status, joined_team_id, checked_in_at)
values
  ('50000000-0000-4000-8000-000000000001'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, 'registered', '40000000-0000-4000-8000-000000000001'::uuid, null),
  ('50000000-0000-4000-8000-000000000002'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, '00000000-0000-4000-8000-000000000107'::uuid, 'registered', null, null),
  ('50000000-0000-4000-8000-000000000003'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, '00000000-0000-4000-8000-000000000111'::uuid, 'registered', null, null),
  ('50000000-0000-4000-8000-000000000004'::uuid, '20000000-0000-4000-8000-000000000002'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, 'registered', null, null),
  ('50000000-0000-4000-8000-000000000005'::uuid, '20000000-0000-4000-8000-000000000002'::uuid, '00000000-0000-4000-8000-000000000112'::uuid, 'registered', null, null),
  ('50000000-0000-4000-8000-000000000006'::uuid, '20000000-0000-4000-8000-000000000003'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, 'registered', '40000000-0000-4000-8000-000000000002'::uuid, null),
  ('50000000-0000-4000-8000-000000000007'::uuid, '20000000-0000-4000-8000-000000000003'::uuid, '00000000-0000-4000-8000-000000000105'::uuid, 'registered', null, null),
  ('50000000-0000-4000-8000-000000000008'::uuid, '20000000-0000-4000-8000-000000000004'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, 'registered', null, null),
  ('50000000-0000-4000-8000-000000000009'::uuid, '20000000-0000-4000-8000-000000000004'::uuid, '00000000-0000-4000-8000-000000000103'::uuid, 'registered', null, null),
  ('50000000-0000-4000-8000-000000000010'::uuid, '20000000-0000-4000-8000-000000000004'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, 'registered', null, null),
  ('50000000-0000-4000-8000-000000000011'::uuid, '20000000-0000-4000-8000-000000000005'::uuid, '00000000-0000-4000-8000-000000000106'::uuid, 'registered', null, null),
  ('50000000-0000-4000-8000-000000000012'::uuid, '20000000-0000-4000-8000-000000000005'::uuid, '00000000-0000-4000-8000-000000000114'::uuid, 'registered', null, null),
  ('50000000-0000-4000-8000-000000000013'::uuid, '20000000-0000-4000-8000-000000000007'::uuid, '00000000-0000-4000-8000-000000000103'::uuid, 'registered', null, null),
  ('50000000-0000-4000-8000-000000000014'::uuid, '20000000-0000-4000-8000-000000000007'::uuid, '00000000-0000-4000-8000-000000000108'::uuid, 'registered', null, null),
  ('50000000-0000-4000-8000-000000000015'::uuid, '20000000-0000-4000-8000-000000000008'::uuid, '00000000-0000-4000-8000-000000000109'::uuid, 'registered', null, null),
  ('50000000-0000-4000-8000-000000000016'::uuid, '20000000-0000-4000-8000-000000000010'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, 'attended', null, now() - interval '9 days' + interval '15 minutes'),
  ('50000000-0000-4000-8000-000000000017'::uuid, '20000000-0000-4000-8000-000000000010'::uuid, '00000000-0000-4000-8000-000000000107'::uuid, 'attended', null, now() - interval '9 days' + interval '19 minutes'),
  ('50000000-0000-4000-8000-000000000018'::uuid, '20000000-0000-4000-8000-000000000010'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, 'attended', null, now() - interval '9 days' + interval '21 minutes'),
  ('50000000-0000-4000-8000-000000000019'::uuid, '20000000-0000-4000-8000-000000000011'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, 'attended', null, now() - interval '18 days' + interval '11 minutes'),
  ('50000000-0000-4000-8000-000000000020'::uuid, '20000000-0000-4000-8000-000000000011'::uuid, '00000000-0000-4000-8000-000000000106'::uuid, 'attended', null, now() - interval '18 days' + interval '12 minutes'),
  ('50000000-0000-4000-8000-000000000021'::uuid, '20000000-0000-4000-8000-000000000011'::uuid, '00000000-0000-4000-8000-000000000112'::uuid, 'absent', null, null)
on conflict (id) do nothing;

insert into public.comments (event_id, user_id, content, parent_id)
values
  ('20000000-0000-4000-8000-000000000001'::uuid, '00000000-0000-4000-8000-000000000103'::uuid, 'Is there a no-code track for early-stage founders?', null),
  ('20000000-0000-4000-8000-000000000001'::uuid, '00000000-0000-4000-8000-000000000010'::uuid, 'Yes. We have a product validation lane with dedicated mentors.', null),
  ('20000000-0000-4000-8000-000000000004'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, 'Can we bring our own datasets for the lab session?', null)
on conflict do nothing;

insert into public.announcements (id, target_type, target_id, title, content, posted_by)
values
  ('60000000-0000-4000-8000-000000000001'::uuid, 'campus', null, 'Campus Fest Week Opens', 'Registrations are now live for fest week experiences across technology, culture, and sports.', '00000000-0000-4000-8000-000000000001'::uuid),
  ('60000000-0000-4000-8000-000000000002'::uuid, 'club', '10000000-0000-4000-8000-000000000001'::uuid, 'Mentor Hours for Tech Hackathon', 'Three pre-hack mentor circles have been added for product, UI, and storytelling.', '00000000-0000-4000-8000-000000000010'::uuid),
  ('60000000-0000-4000-8000-000000000003'::uuid, 'event', '20000000-0000-4000-8000-000000000002'::uuid, 'Performance Auditions Updated', 'Audition slots for solo performers and dance crews have been extended by two days.', '00000000-0000-4000-8000-000000000011'::uuid)
on conflict (id) do nothing;

insert into public.saved_events (user_id, event_id)
values
  ('00000000-0000-4000-8000-000000000101'::uuid, '20000000-0000-4000-8000-000000000007'::uuid),
  ('00000000-0000-4000-8000-000000000101'::uuid, '20000000-0000-4000-8000-000000000002'::uuid)
on conflict (user_id, event_id) do nothing;

insert into public.event_feedback (event_id, user_id, rating, feedback_text)
values
  ('20000000-0000-4000-8000-000000000010'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, 5, 'Practical, fast paced, and useful. The deployment walk-through was excellent.'),
  ('20000000-0000-4000-8000-000000000011'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, 4, 'Loved the stage and judging energy. Backstage coordination could be tighter.')
on conflict (event_id, user_id) do nothing;

insert into public.notifications (user_id, title, message, type, is_read, related_link)
values
  ('00000000-0000-4000-8000-000000000101'::uuid, 'You are registered', 'Your spot for Tech Hackathon 2025 is locked in. QR pass ready.', 'registration', false, '/app/events/tech-hackathon-2025'),
  ('00000000-0000-4000-8000-000000000101'::uuid, 'Certificate eligible', 'Your Cloud Native Bootcamp attendance qualifies you for certificate generation.', 'certificate', false, '/app/certificates'),
  ('00000000-0000-4000-8000-000000000103'::uuid, 'Pitch Arena shortlisting', 'Your Startup Pitch Arena registration is under final review.', 'event', true, '/app/events/startup-pitch-arena')
on conflict do nothing;

insert into public.xp_logs (user_id, event_id, action_type, xp_change, description)
values
  ('00000000-0000-4000-8000-000000000101'::uuid, '20000000-0000-4000-8000-000000000010'::uuid, 'attendance_bonus', 80, 'Attended Cloud Native Bootcamp'),
  ('00000000-0000-4000-8000-000000000104'::uuid, '20000000-0000-4000-8000-000000000011'::uuid, 'attendance_bonus', 70, 'Attended Street Dance Showdown'),
  ('00000000-0000-4000-8000-000000000106'::uuid, '20000000-0000-4000-8000-000000000011'::uuid, 'attendance_bonus', 70, 'Attended Street Dance Showdown')
on conflict do nothing;

do $$
declare
  rec record;
begin
  for rec in
    select id, total_xp
    from public.profiles
  loop
    update public.profiles
    set total_xp = rec.total_xp
    where id = rec.id;
  end loop;

  for rec in
    select id from public.events
  loop
    perform public.refresh_event_participant_count(rec.id);
  end loop;

  for rec in
    select id from public.clubs
  loop
    perform public.refresh_club_member_count(rec.id);
  end loop;

  for rec in
    select id from public.profiles
  loop
    perform public.refresh_profile_engagement_metrics(rec.id);
    perform public.award_badges_if_eligible(rec.id);
  end loop;

  perform public.update_rank_cache();

  perform public.ensure_certificate_placeholder(
    '20000000-0000-4000-8000-000000000010'::uuid,
    '00000000-0000-4000-8000-000000000101'::uuid,
    '50000000-0000-4000-8000-000000000016'::uuid
  );
  perform public.ensure_certificate_placeholder(
    '20000000-0000-4000-8000-000000000011'::uuid,
    '00000000-0000-4000-8000-000000000104'::uuid,
    '50000000-0000-4000-8000-000000000019'::uuid
  );
  perform public.ensure_certificate_placeholder(
    '20000000-0000-4000-8000-000000000011'::uuid,
    '00000000-0000-4000-8000-000000000106'::uuid,
    '50000000-0000-4000-8000-000000000020'::uuid
  );
end $$;

commit;
