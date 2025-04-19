-- Migration: Initial schema setup for Shortcuts Manager MVP
-- Description: Creates tables for applications, shortcut groups, shortcuts, and their relationships
-- with proper RLS policies and cascading rules

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create enum type for operating systems
create type operating_system_enum as enum ('Windows', 'macOS', 'Linux', 'Other');

-- Create applications table
create table applications (
    id uuid primary key default uuid_generate_v4(),
    name varchar(255) not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Disable RLS for applications
alter table applications disable row level security;

-- Create shortcut groups table
create table shortcut_groups (
    id uuid primary key default uuid_generate_v4(),
    name varchar(255) not null,
    description text,
    operating_system operating_system_enum not null,
    application_id uuid references applications(id) on delete set null,
    user_id uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Disable RLS for shortcut groups
alter table shortcut_groups disable row level security;

-- Create shortcuts table
create table shortcuts (
    id uuid primary key default uuid_generate_v4(),
    name varchar(255) not null,
    keys varchar(255) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Disable RLS for shortcuts
alter table shortcuts disable row level security;

-- Create join table for groups and shortcuts
create table group_shortcuts (
    group_id uuid not null references shortcut_groups(id) on delete cascade,
    shortcut_id uuid not null references shortcuts(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (group_id, shortcut_id)
);

-- Disable RLS for group_shortcuts
alter table group_shortcuts disable row level security;

-- Create indexes
create index idx_shortcut_groups_application_id on shortcut_groups(application_id);
create index idx_shortcut_groups_user_id on shortcut_groups(user_id);
create index idx_shortcut_groups_operating_system on shortcut_groups(operating_system);
create index idx_shortcuts_name on shortcuts(name);
create index idx_group_shortcuts_shortcut_id on group_shortcuts(shortcut_id);

-- Create updated_at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_applications_updated_at
    before update on applications
    for each row
    execute function update_updated_at_column();

create trigger update_shortcut_groups_updated_at
    before update on shortcut_groups
    for each row
    execute function update_updated_at_column();

create trigger update_shortcuts_updated_at
    before update on shortcuts
    for each row
    execute function update_updated_at_column();

-- RLS Policies

-- Applications policies
create policy "Applications are viewable by everyone"
    on applications for select
    using (true);

create policy "Applications are insertable by authenticated users"
    on applications for insert
    with check (auth.role() = 'authenticated');

create policy "Applications are updatable by authenticated users"
    on applications for update
    using (auth.role() = 'authenticated');

-- Shortcut groups policies
create policy "Shortcut groups are viewable by everyone if public or by owner if private"
    on shortcut_groups for select
    using (
        user_id is null or -- public groups
        auth.uid() = user_id -- user's own groups
    );

create policy "Shortcut groups are insertable by authenticated users"
    on shortcut_groups for insert
    with check (
        auth.role() = 'authenticated' and
        auth.uid() = user_id
    );

create policy "Shortcut groups are updatable by owner"
    on shortcut_groups for update
    using (auth.uid() = user_id);

create policy "Shortcut groups are deletable by owner"
    on shortcut_groups for delete
    using (auth.uid() = user_id);

-- Shortcuts policies
create policy "Shortcuts are viewable by everyone"
    on shortcuts for select
    using (true);

create policy "Shortcuts are insertable by authenticated users"
    on shortcuts for insert
    with check (auth.role() = 'authenticated');

create policy "Shortcuts are updatable by authenticated users"
    on shortcuts for update
    using (auth.role() = 'authenticated');

-- Group shortcuts policies
create policy "Group shortcuts are viewable by everyone if group is public or by owner if private"
    on group_shortcuts for select
    using (
        exists (
            select 1 from shortcut_groups sg
            where sg.id = group_id
            and (sg.user_id is null or sg.user_id = auth.uid())
        )
    );

create policy "Group shortcuts are insertable by group owner"
    on group_shortcuts for insert
    with check (
        exists (
            select 1 from shortcut_groups sg
            where sg.id = group_id
            and sg.user_id = auth.uid()
        )
    );

create policy "Group shortcuts are deletable by group owner"
    on group_shortcuts for delete
    using (
        exists (
            select 1 from shortcut_groups sg
            where sg.id = group_id
            and sg.user_id = auth.uid()
        )
    );
