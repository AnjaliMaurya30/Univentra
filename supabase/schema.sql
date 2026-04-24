-- Univentra Supabase schema
-- Run this in the Supabase SQL editor before seed.sql.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default 'New Student',
  email text not null unique,
  role text not null default 'student' check (role in ('student', 'organizer', 'admin')),
  avatar_url text,
  department text,
  year_of_study text,
  bio text,
  favorite_category text,
  total_xp integer not null default 0,
  level integer not null default 1,
  rank_cache integer,
  participation_rate numeric not null default 0,
  total_hours numeric not null default 0,
  member_since timestamptz not null default now(),
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null,
  logo_url text,
  cover_url text,
  category text not null,
  created_by uuid references public.profiles (id),
  is_active boolean not null default true,
  member_count_cache integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.club_members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_in_club text not null default 'member' check (role_in_club in ('member', 'coordinator', 'president')),
  joined_at timestamptz not null default now(),
  is_active boolean not null default true,
  unique (club_id, user_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  short_description text not null,
  organizer_type text not null check (organizer_type in ('club', 'admin')),
  organizer_id uuid not null,
  banner_url text,
  venue text not null,
  mode text not null check (mode in ('offline', 'online', 'hybrid')),
  meeting_link text,
  category text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  registration_deadline timestamptz not null,
  max_participants integer not null check (max_participants > 0),
  current_participants integer not null default 0,
  team_based boolean not null default false,
  certificate_enabled boolean not null default true,
  attendance_qr_enabled boolean not null default true,
  status text not null default 'pending' check (status in ('draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled', 'full')),
  xp_reward integer not null default 50 check (xp_reward >= 0),
  created_by uuid references public.profiles (id),
  approved_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_time_check check (end_time > start_time),
  constraint events_deadline_check check (registration_deadline <= start_time)
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  registration_status text not null default 'registered' check (registration_status in ('registered', 'waitlisted', 'cancelled', 'attended', 'absent')),
  qr_code_value text unique,
  joined_team_id uuid,
  certificate_issued boolean not null default false,
  certificate_url text,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  team_name text not null,
  leader_id uuid not null references public.profiles (id),
  max_members integer not null default 5,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  icon text not null,
  criteria_type text not null,
  criteria_value integer not null,
  badge_color text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create table if not exists public.xp_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid references public.events (id) on delete set null,
  action_type text not null,
  xp_change integer not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  parent_id uuid references public.comments (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('campus', 'club', 'event')),
  target_id uuid,
  title text not null,
  content text not null,
  posted_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  is_read boolean not null default false,
  related_link text,
  created_at timestamptz not null default now()
);

create table if not exists public.event_feedback (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  feedback_text text not null,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists public.saved_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  registration_id uuid not null references public.event_registrations (id) on delete cascade,
  certificate_number text not null unique,
  certificate_url text,
  issued_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table public.event_registrations
  drop constraint if exists event_registrations_joined_team_id_fkey;

alter table public.event_registrations
  add constraint event_registrations_joined_team_id_fkey
  foreign key (joined_team_id) references public.teams (id) on delete set null;

create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_profiles_rank on public.profiles (rank_cache);
create index if not exists idx_clubs_category on public.clubs (category);
create index if not exists idx_club_members_user on public.club_members (user_id);
create index if not exists idx_events_status_start on public.events (status, start_time);
create index if not exists idx_events_category on public.events (category);
create index if not exists idx_event_registrations_event on public.event_registrations (event_id);
create index if not exists idx_event_registrations_user on public.event_registrations (user_id);
create index if not exists idx_event_registrations_status on public.event_registrations (registration_status);
create index if not exists idx_comments_event on public.comments (event_id, created_at desc);
create index if not exists idx_announcements_target on public.announcements (target_type, target_id);
create index if not exists idx_notifications_user on public.notifications (user_id, is_read, created_at desc);
create index if not exists idx_feedback_event on public.event_feedback (event_id);
create index if not exists idx_saved_events_user on public.saved_events (user_id);
create index if not exists idx_certificates_user on public.certificates (user_id);
create index if not exists idx_xp_logs_user on public.xp_logs (user_id, created_at desc);
create index if not exists idx_user_badges_user on public.user_badges (user_id);

create or replace function public.recalculate_level_from_xp(p_total_xp integer)
returns integer
language plpgsql
immutable
as $$
begin
  if p_total_xp < 150 then
    return 1;
  elsif p_total_xp < 350 then
    return 2;
  elsif p_total_xp < 650 then
    return 3;
  elsif p_total_xp < 1000 then
    return 4;
  elsif p_total_xp < 1450 then
    return 5;
  elsif p_total_xp < 1950 then
    return 6;
  else
    return floor(p_total_xp / 350) + 1;
  end if;
end;
$$;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'student');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'admin';
$$;

create or replace function public.is_organizer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('organizer', 'admin');
$$;

create or replace function public.user_can_manage_club(p_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.club_members cm
      where cm.club_id = p_club_id
        and cm.user_id = auth.uid()
        and cm.is_active
        and cm.role_in_club in ('coordinator', 'president')
    )
    or exists (
      select 1
      from public.clubs c
      where c.id = p_club_id
        and c.created_by = auth.uid()
    );
$$;

create or replace function public.user_can_manage_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.events e
      where e.id = p_event_id
        and (
          e.created_by = auth.uid()
          or (e.organizer_type = 'club' and public.user_can_manage_club(e.organizer_id))
        )
    );
$$;

create or replace function public.create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_related_link text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then
    return;
  end if;

  insert into public.notifications (user_id, title, message, type, related_link)
  values (p_user_id, p_title, p_message, p_type, p_related_link);
end;
$$;

create or replace function public.update_rank_cache()
returns void
language sql
security definer
set search_path = public
as $$
  with ranked as (
    select
      id,
      dense_rank() over (order by total_xp desc, created_at asc) as rank_value
    from public.profiles
    where role = 'student'
  )
  update public.profiles p
  set rank_cache = ranked.rank_value
  from ranked
  where p.id = ranked.id;
$$;

create or replace function public.refresh_profile_engagement_metrics(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_registered_count integer := 0;
  v_attended_count integer := 0;
  v_total_hours numeric := 0;
begin
  select
    count(*) filter (where registration_status in ('registered', 'attended', 'absent', 'waitlisted')),
    count(*) filter (where registration_status = 'attended'),
    coalesce(sum(extract(epoch from (e.end_time - e.start_time)) / 3600) filter (where er.registration_status = 'attended'), 0)
  into v_registered_count, v_attended_count, v_total_hours
  from public.event_registrations er
  join public.events e on e.id = er.event_id
  where er.user_id = p_user_id;

  update public.profiles
  set
    participation_rate = case
      when v_registered_count = 0 then 0
      else round((v_attended_count::numeric / v_registered_count::numeric) * 100, 2)
    end,
    total_hours = v_total_hours,
    level = public.recalculate_level_from_xp(total_xp)
  where id = p_user_id;
end;
$$;

create or replace function public.refresh_club_member_count(p_club_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.clubs
  set member_count_cache = (
    select count(*)
    from public.club_members
    where club_id = p_club_id
      and is_active
  )
  where id = p_club_id;
$$;

create or replace function public.mark_event_full_if_capacity_reached(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current integer;
  v_max integer;
  v_status text;
begin
  select current_participants, max_participants, status
  into v_current, v_max, v_status
  from public.events
  where id = p_event_id;

  if v_status in ('completed', 'cancelled', 'rejected', 'draft') then
    return;
  end if;

  if v_current >= v_max then
    update public.events set status = 'full' where id = p_event_id;
  elsif v_status = 'full' then
    update public.events set status = 'approved' where id = p_event_id;
  end if;
end;
$$;

create or replace function public.refresh_event_participant_count(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.events
  set current_participants = (
    select count(*)
    from public.event_registrations er
    where er.event_id = p_event_id
      and er.registration_status in ('registered', 'waitlisted', 'attended')
  )
  where id = p_event_id;

  perform public.mark_event_full_if_capacity_reached(p_event_id);
end;
$$;

create or replace function public.generate_registration_qr_value()
returns trigger
language plpgsql
as $$
begin
  if new.qr_code_value is null or length(trim(new.qr_code_value)) = 0 then
    new.qr_code_value := 'UVR-' || upper(encode(gen_random_bytes(10), 'hex'));
  end if;
  return new;
end;
$$;

create or replace function public.award_badges_if_eligible(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attended integer := 0;
  v_xp integer := 0;
  v_clubs integer := 0;
  badge_row record;
begin
  select count(*) into v_attended
  from public.event_registrations
  where user_id = p_user_id
    and registration_status = 'attended';

  select count(*) into v_clubs
  from public.club_members
  where user_id = p_user_id
    and is_active;

  select coalesce(total_xp, 0) into v_xp
  from public.profiles
  where id = p_user_id;

  for badge_row in
    select *
    from public.badges
  loop
    if (
      (badge_row.criteria_type = 'events_attended' and v_attended >= badge_row.criteria_value)
      or (badge_row.criteria_type = 'xp_total' and v_xp >= badge_row.criteria_value)
      or (badge_row.criteria_type = 'clubs_joined' and v_clubs >= badge_row.criteria_value)
    ) then
      insert into public.user_badges (user_id, badge_id)
      values (p_user_id, badge_row.id)
      on conflict (user_id, badge_id) do nothing;

      if found then
        perform public.create_notification(
          p_user_id,
          'Badge unlocked',
          'You earned the ' || badge_row.name || ' badge.',
          'badge',
          '/app/profile'
        );
      end if;
    end if;
  end loop;
end;
$$;

create or replace function public.ensure_certificate_placeholder(
  p_event_id uuid,
  p_user_id uuid,
  p_registration_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events;
  v_registration public.event_registrations;
  v_certificate_number text;
begin
  select * into v_event from public.events where id = p_event_id;
  select * into v_registration from public.event_registrations where id = p_registration_id;

  if v_event.id is null or v_registration.id is null then
    return;
  end if;

  if not v_event.certificate_enabled or v_event.status <> 'completed' or v_registration.registration_status <> 'attended' then
    return;
  end if;

  v_certificate_number := 'UV-CERT-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(p_event_id::text || p_user_id::text), 1, 10));

  insert into public.certificates (event_id, user_id, registration_id, certificate_number, certificate_url)
  values (p_event_id, p_user_id, p_registration_id, v_certificate_number, null)
  on conflict (event_id, user_id) do nothing;

  perform public.create_notification(
    p_user_id,
    'Certificate unlocked',
    'You are now eligible to generate your certificate for ' || v_event.title || '.',
    'certificate',
    '/app/certificates'
  );
end;
$$;

create or replace function public.award_xp_for_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events;
  v_registration_xp integer := 20;
begin
  select * into v_event from public.events where id = new.event_id;

  if new.registration_status = 'registered' then
    update public.profiles
    set total_xp = total_xp + v_registration_xp
    where id = new.user_id;

    insert into public.xp_logs (user_id, event_id, action_type, xp_change, description)
    values (
      new.user_id,
      new.event_id,
      'registration',
      v_registration_xp,
      'Registered for ' || coalesce(v_event.title, 'an event')
    );

    perform public.create_notification(
      new.user_id,
      'Registration confirmed',
      'Your spot for ' || coalesce(v_event.title, 'the event') || ' is confirmed.',
      'registration',
      '/app/events/' || coalesce(v_event.slug, '')
    );

    perform public.refresh_profile_engagement_metrics(new.user_id);
    perform public.award_badges_if_eligible(new.user_id);
    perform public.update_rank_cache();
  end if;

  return new;
end;
$$;

create or replace function public.award_xp_for_attendance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events;
begin
  if new.registration_status = 'attended' and old.registration_status is distinct from 'attended' then
    select * into v_event from public.events where id = new.event_id;

    update public.profiles
    set total_xp = total_xp + coalesce(v_event.xp_reward, 0)
    where id = new.user_id;

    insert into public.xp_logs (user_id, event_id, action_type, xp_change, description)
    values (
      new.user_id,
      new.event_id,
      'attendance',
      coalesce(v_event.xp_reward, 0),
      'Attendance confirmed for ' || coalesce(v_event.title, 'an event')
    );

    perform public.create_notification(
      new.user_id,
      'Attendance confirmed',
      'You checked in successfully for ' || coalesce(v_event.title, 'the event') || '.',
      'attendance',
      '/app/events/' || coalesce(v_event.slug, '')
    );

    perform public.refresh_profile_engagement_metrics(new.user_id);
    perform public.award_badges_if_eligible(new.user_id);
    perform public.update_rank_cache();
    perform public.ensure_certificate_placeholder(new.event_id, new.user_id, new.id);
  end if;

  return new;
end;
$$;

create or replace function public.create_certificate_record_when_event_completed_and_attended()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  registration_row record;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    for registration_row in
      select id, user_id
      from public.event_registrations
      where event_id = new.id
        and registration_status = 'attended'
    loop
      perform public.ensure_certificate_placeholder(new.id, registration_row.user_id, registration_row.id);
    end loop;
  end if;

  return new;
end;
$$;

create or replace function public.handle_profile_level_sync()
returns trigger
language plpgsql
as $$
begin
  new.level = public.recalculate_level_from_xp(coalesce(new.total_xp, 0));
  return new;
end;
$$;

create or replace function public.handle_club_membership_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_club_id uuid;
  v_user_id uuid;
begin
  v_club_id := coalesce(new.club_id, old.club_id);
  v_user_id := coalesce(new.user_id, old.user_id);

  perform public.refresh_club_member_count(v_club_id);
  perform public.award_badges_if_eligible(v_user_id);
  return coalesce(new, old);
end;
$$;

create or replace function public.handle_event_registration_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_user_id uuid;
begin
  v_event_id := coalesce(new.event_id, old.event_id);
  v_user_id := coalesce(new.user_id, old.user_id);

  perform public.refresh_event_participant_count(v_event_id);
  perform public.refresh_profile_engagement_metrics(v_user_id);
  return coalesce(new, old);
end;
$$;

create or replace function public.auto_create_profile_after_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := lower(coalesce(new.raw_user_meta_data ->> 'role', 'student'));
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    department,
    year_of_study,
    favorite_category,
    interests
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    case when v_role in ('student', 'organizer', 'admin') then v_role else 'student' end,
    nullif(new.raw_user_meta_data ->> 'department', ''),
    nullif(new.raw_user_meta_data ->> 'year_of_study', ''),
    nullif(new.raw_user_meta_data ->> 'favorite_category', ''),
    coalesce(
      array(
        select jsonb_array_elements_text(
          case
            when jsonb_typeof(new.raw_user_meta_data -> 'interests') = 'array'
              then new.raw_user_meta_data -> 'interests'
            else '[]'::jsonb
          end
        )
      ),
      '{}'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at
before update on public.events
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_profiles_level_sync on public.profiles;
create trigger trg_profiles_level_sync
before insert or update of total_xp on public.profiles
for each row execute function public.handle_profile_level_sync();

drop trigger if exists trg_registration_qr on public.event_registrations;
create trigger trg_registration_qr
before insert on public.event_registrations
for each row execute function public.generate_registration_qr_value();

drop trigger if exists trg_registration_award_xp on public.event_registrations;
create trigger trg_registration_award_xp
after insert on public.event_registrations
for each row execute function public.award_xp_for_registration();

drop trigger if exists trg_registration_attendance_xp on public.event_registrations;
create trigger trg_registration_attendance_xp
after update of registration_status on public.event_registrations
for each row execute function public.award_xp_for_attendance();

drop trigger if exists trg_registration_counts on public.event_registrations;
create trigger trg_registration_counts
after insert or update or delete on public.event_registrations
for each row execute function public.handle_event_registration_change();

drop trigger if exists trg_club_membership_counts on public.club_members;
create trigger trg_club_membership_counts
after insert or update or delete on public.club_members
for each row execute function public.handle_club_membership_change();

drop trigger if exists trg_event_completed_certificates on public.events;
create trigger trg_event_completed_certificates
after update of status on public.events
for each row execute function public.create_certificate_record_when_event_completed_and_attended();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.auto_create_profile_after_signup();

alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.xp_logs enable row level security;
alter table public.comments enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.event_feedback enable row level security;
alter table public.saved_events enable row level security;
alter table public.certificates enable row level security;

drop policy if exists "Profiles readable by authenticated users" on public.profiles;
create policy "Profiles readable by authenticated users"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users update own profile or admins update any profile" on public.profiles;
create policy "Users update own profile or admins update any profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "Admins can insert profiles" on public.profiles;
create policy "Admins can insert profiles"
on public.profiles
for insert
to authenticated
with check (public.is_admin() or auth.uid() = id);

drop policy if exists "Active clubs are readable" on public.clubs;
create policy "Active clubs are readable"
on public.clubs
for select
to authenticated
using (is_active or public.is_admin() or created_by = auth.uid());

drop policy if exists "Organizers and admins can create clubs" on public.clubs;
create policy "Organizers and admins can create clubs"
on public.clubs
for insert
to authenticated
with check (public.is_organizer());

drop policy if exists "Club owners and admins can update clubs" on public.clubs;
create policy "Club owners and admins can update clubs"
on public.clubs
for update
to authenticated
using (public.is_admin() or public.user_can_manage_club(id))
with check (public.is_admin() or public.user_can_manage_club(id));

drop policy if exists "Club memberships readable by authenticated users" on public.club_members;
create policy "Club memberships readable by authenticated users"
on public.club_members
for select
to authenticated
using (true);

drop policy if exists "Users can join clubs and managers can manage memberships" on public.club_members;
create policy "Users can join clubs and managers can manage memberships"
on public.club_members
for insert
to authenticated
with check (
  auth.uid() = user_id
  or public.is_admin()
  or public.user_can_manage_club(club_id)
);

drop policy if exists "Users can update their own membership and managers can update memberships" on public.club_members;
create policy "Users can update their own membership and managers can update memberships"
on public.club_members
for update
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
  or public.user_can_manage_club(club_id)
)
with check (
  auth.uid() = user_id
  or public.is_admin()
  or public.user_can_manage_club(club_id)
);

drop policy if exists "Approved events readable and managers can read their own events" on public.events;
create policy "Approved events readable and managers can read their own events"
on public.events
for select
to authenticated
using (
  status in ('approved', 'completed', 'full')
  or public.is_admin()
  or created_by = auth.uid()
  or (organizer_type = 'club' and public.user_can_manage_club(organizer_id))
);

drop policy if exists "Organizers and admins can insert events" on public.events;
create policy "Organizers and admins can insert events"
on public.events
for insert
to authenticated
with check (
  (
    public.is_admin()
    and created_by = auth.uid()
  )
  or (
    public.current_user_role() = 'organizer'
    and created_by = auth.uid()
    and organizer_type = 'club'
    and public.user_can_manage_club(organizer_id)
  )
);

drop policy if exists "Managers and admins can update events" on public.events;
create policy "Managers and admins can update events"
on public.events
for update
to authenticated
using (public.user_can_manage_event(id))
with check (
  public.is_admin()
  or (
    organizer_type = 'club'
    and public.user_can_manage_club(organizer_id)
  )
);

drop policy if exists "Users read own registrations and managers read event registrations" on public.event_registrations;
create policy "Users read own registrations and managers read event registrations"
on public.event_registrations
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
  or public.user_can_manage_event(event_id)
);

drop policy if exists "Students can register themselves and managers can create registrations" on public.event_registrations;
create policy "Students can register themselves and managers can create registrations"
on public.event_registrations
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.events e
    where e.id = event_id
      and e.status in ('approved', 'full')
      and e.registration_deadline >= now()
  )
);

drop policy if exists "Users can update own registration and managers can manage attendance" on public.event_registrations;
create policy "Users can update own registration and managers can manage attendance"
on public.event_registrations
for update
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
  or public.user_can_manage_event(event_id)
)
with check (
  auth.uid() = user_id
  or public.is_admin()
  or public.user_can_manage_event(event_id)
);

drop policy if exists "Teams readable to authenticated event participants" on public.teams;
create policy "Teams readable to authenticated event participants"
on public.teams
for select
to authenticated
using (
  public.is_admin()
  or public.user_can_manage_event(event_id)
  or exists (
    select 1
    from public.event_registrations er
    where er.event_id = teams.event_id
      and er.user_id = auth.uid()
  )
);

drop policy if exists "Participants and managers can create teams" on public.teams;
create policy "Participants and managers can create teams"
on public.teams
for insert
to authenticated
with check (
  public.is_admin()
  or public.user_can_manage_event(event_id)
  or leader_id = auth.uid()
);

drop policy if exists "Team members readable to authenticated event participants" on public.team_members;
create policy "Team members readable to authenticated event participants"
on public.team_members
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.teams t
    where t.id = team_id
      and (
        public.user_can_manage_event(t.event_id)
        or exists (
          select 1
          from public.event_registrations er
          where er.event_id = t.event_id
            and er.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "Participants and managers can create team memberships" on public.team_members;
create policy "Participants and managers can create team memberships"
on public.team_members
for insert
to authenticated
with check (
  auth.uid() = user_id
  or public.is_admin()
  or exists (
    select 1
    from public.teams t
    where t.id = team_id
      and public.user_can_manage_event(t.event_id)
  )
);

drop policy if exists "Badges readable by authenticated users" on public.badges;
create policy "Badges readable by authenticated users"
on public.badges
for select
to authenticated
using (true);

drop policy if exists "User badges readable by authenticated users" on public.user_badges;
create policy "User badges readable by authenticated users"
on public.user_badges
for select
to authenticated
using (true);

drop policy if exists "Admins manage user badges" on public.user_badges;
create policy "Admins manage user badges"
on public.user_badges
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "XP logs readable to owners and admins" on public.xp_logs;
create policy "XP logs readable to owners and admins"
on public.xp_logs
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
  or exists (
    select 1
    from public.events e
    where e.id = xp_logs.event_id
      and public.user_can_manage_event(e.id)
  )
);

drop policy if exists "Comments readable on approved events" on public.comments;
create policy "Comments readable on approved events"
on public.comments
for select
to authenticated
using (
  exists (
    select 1
    from public.events e
    where e.id = comments.event_id
      and e.status in ('approved', 'completed', 'full')
  )
);

drop policy if exists "Authenticated users can comment on approved events" on public.comments;
create policy "Authenticated users can comment on approved events"
on public.comments
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.events e
    where e.id = event_id
      and e.status in ('approved', 'completed', 'full')
  )
);

drop policy if exists "Comment owners and admins can update comments" on public.comments;
create policy "Comment owners and admins can update comments"
on public.comments
for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Announcements visible by target audience" on public.announcements;
create policy "Announcements visible by target audience"
on public.announcements
for select
to authenticated
using (
  public.is_organizer()
  or target_type = 'campus'
  or (
    target_type = 'club'
    and exists (
      select 1
      from public.club_members cm
      where cm.club_id = announcements.target_id
        and cm.user_id = auth.uid()
        and cm.is_active
    )
  )
  or (
    target_type = 'event'
    and exists (
      select 1
      from public.event_registrations er
      where er.event_id = announcements.target_id
        and er.user_id = auth.uid()
    )
  )
);

drop policy if exists "Organizers and admins can insert announcements" on public.announcements;
create policy "Organizers and admins can insert announcements"
on public.announcements
for insert
to authenticated
with check (
  public.is_organizer()
  and (
    public.is_admin()
    or (
      target_type = 'campus' and public.is_admin()
    )
    or (
      target_type = 'club' and public.user_can_manage_club(target_id)
    )
    or (
      target_type = 'event' and public.user_can_manage_event(target_id)
    )
  )
);

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications"
on public.notifications
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications"
on public.notifications
for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins insert notifications" on public.notifications;
create policy "Admins insert notifications"
on public.notifications
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Feedback visible to owners and event managers" on public.event_feedback;
create policy "Feedback visible to owners and event managers"
on public.event_feedback
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
  or public.user_can_manage_event(event_id)
);

drop policy if exists "Attendees can submit feedback" on public.event_feedback;
create policy "Attendees can submit feedback"
on public.event_feedback
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.event_registrations er
    join public.events e on e.id = er.event_id
    where er.event_id = event_feedback.event_id
      and er.user_id = auth.uid()
      and er.registration_status = 'attended'
      and e.status = 'completed'
  )
);

drop policy if exists "Attendees can update their own feedback" on public.event_feedback;
create policy "Attendees can update their own feedback"
on public.event_feedback
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users read own saved events" on public.saved_events;
create policy "Users read own saved events"
on public.saved_events
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users manage own saved events" on public.saved_events;
create policy "Users manage own saved events"
on public.saved_events
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users update own saved events" on public.saved_events;
create policy "Users update own saved events"
on public.saved_events
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own saved events" on public.saved_events;
create policy "Users delete own saved events"
on public.saved_events
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Certificates visible to owners admins and event managers" on public.certificates;
create policy "Certificates visible to owners admins and event managers"
on public.certificates
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
  or public.user_can_manage_event(event_id)
);

drop policy if exists "Event managers and admins issue certificates" on public.certificates;
create policy "Event managers and admins issue certificates"
on public.certificates
for insert
to authenticated
with check (public.is_admin() or public.user_can_manage_event(event_id));

drop policy if exists "Event managers and admins update certificates" on public.certificates;
create policy "Event managers and admins update certificates"
on public.certificates
for update
to authenticated
using (public.is_admin() or public.user_can_manage_event(event_id))
with check (public.is_admin() or public.user_can_manage_event(event_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('club-assets', 'club-assets', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('event-banners', 'event-banners', true, 15728640, array['image/png', 'image/jpeg', 'image/webp']),
  ('certificates', 'certificates', false, 10485760, array['application/pdf'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatars are publicly readable" on storage.objects;
create policy "Avatars are publicly readable"
on storage.objects
for select
using (bucket_id = 'avatars');

drop policy if exists "Users upload own avatars" on storage.objects;
create policy "Users upload own avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users update own avatars" on storage.objects;
create policy "Users update own avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users delete own avatars" on storage.objects;
create policy "Users delete own avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Club assets publicly readable" on storage.objects;
create policy "Club assets publicly readable"
on storage.objects
for select
using (bucket_id = 'club-assets');

drop policy if exists "Organizers upload club assets" on storage.objects;
create policy "Organizers upload club assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'club-assets'
  and public.is_organizer()
);

drop policy if exists "Organizers update club assets" on storage.objects;
create policy "Organizers update club assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'club-assets'
  and public.is_organizer()
)
with check (
  bucket_id = 'club-assets'
  and public.is_organizer()
);

drop policy if exists "Organizers delete club assets" on storage.objects;
create policy "Organizers delete club assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'club-assets'
  and public.is_organizer()
);

drop policy if exists "Event banners publicly readable" on storage.objects;
create policy "Event banners publicly readable"
on storage.objects
for select
using (bucket_id = 'event-banners');

drop policy if exists "Organizers upload event banners" on storage.objects;
create policy "Organizers upload event banners"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'event-banners'
  and public.is_organizer()
);

drop policy if exists "Organizers update event banners" on storage.objects;
create policy "Organizers update event banners"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'event-banners'
  and public.is_organizer()
)
with check (
  bucket_id = 'event-banners'
  and public.is_organizer()
);

drop policy if exists "Organizers delete event banners" on storage.objects;
create policy "Organizers delete event banners"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'event-banners'
  and public.is_organizer()
);

drop policy if exists "Certificate files are readable by owners and managers" on storage.objects;
create policy "Certificate files are readable by owners and managers"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'certificates'
  and (
    public.is_admin()
    or auth.uid()::text = (storage.foldername(name))[1]
    or public.user_can_manage_event(((storage.foldername(name))[2])::uuid)
  )
);

drop policy if exists "Certificate files are writable by managers" on storage.objects;
create policy "Certificate files are writable by managers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'certificates'
  and (
    public.is_admin()
    or public.user_can_manage_event(((storage.foldername(name))[2])::uuid)
  )
);

drop policy if exists "Certificate files are updatable by managers" on storage.objects;
create policy "Certificate files are updatable by managers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'certificates'
  and (
    public.is_admin()
    or public.user_can_manage_event(((storage.foldername(name))[2])::uuid)
  )
)
with check (
  bucket_id = 'certificates'
  and (
    public.is_admin()
    or public.user_can_manage_event(((storage.foldername(name))[2])::uuid)
  )
);

drop policy if exists "Certificate files are deletable by managers" on storage.objects;
create policy "Certificate files are deletable by managers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'certificates'
  and (
    public.is_admin()
    or public.user_can_manage_event(((storage.foldername(name))[2])::uuid)
  )
);
