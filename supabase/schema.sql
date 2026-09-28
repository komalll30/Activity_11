-- Run in Supabase Dashboard > SQL Editor. Policies below are for a public college demo.
create extension if not exists pgcrypto;

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  duration integer not null check (duration > 0),
  price numeric(10, 2) not null check (price >= 0),
  description text not null default '',
  features text[] not null default '{}',
  available boolean not null default true
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  age integer not null check (age between 13 and 100),
  gender text not null,
  membership_id uuid not null references public.memberships(id),
  fitness_goal text not null,
  workout_time text not null,
  emergency_contact text not null,
  notes text not null default '',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- Add the new fields when upgrading the previous IronNest demo schema.
alter table public.members add column if not exists phone text;
alter table public.members add column if not exists age integer;
alter table public.members add column if not exists gender text;
alter table public.members add column if not exists membership_id uuid references public.memberships(id);
alter table public.members add column if not exists fitness_goal text;
alter table public.members add column if not exists workout_time text;
alter table public.members add column if not exists emergency_contact text;
alter table public.members add column if not exists notes text not null default '';
alter table public.members add column if not exists status text not null default 'active';
alter table public.members add column if not exists created_at timestamptz not null default now();

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  specialization text not null,
  experience integer not null check (experience >= 0),
  availability text not null,
  training_type text not null
);

insert into public.memberships (name, duration, price, description, features, available)
values
  ('Basic', 1, 999, 'The essentials for building a consistent training routine.', array['Gym floor access', 'Locker room', 'Fitness assessment'], true),
  ('Student', 1, 699, 'Flexible training for students balancing a full schedule.', array['Gym floor access', 'Student rate', 'Group classes'], true),
  ('Premium', 3, 4999, 'More coaching and recovery support to keep your progress moving.', array['Unlimited gym access', 'Two coaching sessions', 'Monthly body check'], true),
  ('Elite', 12, 17999, 'Our complete year-round training and coaching experience.', array['24/7 gym access', 'Weekly personal training', 'Nutrition guidance', 'Guest passes'], true)
on conflict (name) do nothing;

-- Preserve memberships and member links if the previous plans table already exists.
do $$
begin
  if to_regclass('public.plans') is not null then
    execute $migration$
      insert into public.memberships (name, duration, price, description, features, available)
      select name, 1, price, 'Migrated from the previous membership plan table.', features, true
      from public.plans
      on conflict (name) do nothing
    $migration$;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'members' and column_name = 'plan_id'
    ) then
      execute $migration$
        update public.members as member
        set membership_id = membership.id
        from public.plans as plan
        join public.memberships as membership on membership.name = plan.name
        where member.plan_id = plan.id and member.membership_id is null
      $migration$;
    end if;
  end if;
end
$$;

insert into public.trainers (name, specialization, experience, availability, training_type)
values
  ('Aarav Mehta', 'Strength and conditioning', 8, 'Weekdays, 6am–2pm', 'Strength Trainer'),
  ('Maya Kapoor', 'Mobility and recovery', 6, 'Weekdays, 10am–6pm', 'Yoga Instructor'),
  ('Kabir Shah', 'Cardiovascular fitness', 5, 'Evenings, 3pm–10pm', 'Cardio Coach'),
  ('Anaya Rao', 'Personal coaching', 10, 'By appointment', 'Personal Trainer')
on conflict (name) do nothing;

alter table public.memberships enable row level security;
alter table public.members enable row level security;
alter table public.trainers enable row level security;

drop policy if exists "Public can read memberships" on public.memberships;
create policy "Public can read memberships" on public.memberships for select to anon, authenticated using (true);
drop policy if exists "Public can read trainers" on public.trainers;
create policy "Public can read trainers" on public.trainers for select to anon, authenticated using (true);
drop policy if exists "Public can register members" on public.members;
create policy "Public can register members" on public.members for insert to anon, authenticated with check (true);
drop policy if exists "Public can read member directory" on public.members;
create policy "Public can read member directory" on public.members for select to anon, authenticated using (true);

revoke all on public.members from anon, authenticated;
grant select (id, name, email, phone, membership_id, fitness_goal, status, created_at) on public.members to anon, authenticated;
grant insert (name, email, phone, age, gender, membership_id, fitness_goal, workout_time, emergency_contact, notes) on public.members to anon, authenticated;
grant select on public.memberships, public.trainers to anon, authenticated;
