-- Users and Lucia tables
create table if not exists users (
  id text primary key,
  username text not null,
  display_name text,
  email text,
  avatar_url text,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table if not exists sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  expires_at timestamp not null
);
create index if not exists sessions_user_idx on sessions(user_id);

create table if not exists keys (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  hashed_password text
);

-- Organizations & RBAC
create table if not exists organizations (
  id text primary key,
  name text not null,
  created_at timestamp not null default now()
);

create table if not exists memberships (
  user_id text not null references users(id) on delete cascade,
  org_id text not null references organizations(id) on delete cascade,
  role text not null default 'member',
  created_at timestamp not null default now(),
  constraint memberships_pk primary key (user_id, org_id)
);
create index if not exists memberships_user_idx on memberships(user_id);
create index if not exists memberships_org_idx on memberships(org_id);

-- Audit log
create table if not exists audit_logs (
  id bigserial primary key,
  org_id text references organizations(id) on delete set null,
  actor_user_id text references users(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp not null default now()
);
create index if not exists audit_logs_created_idx on audit_logs(created_at);
