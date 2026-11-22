-- Дневник настроения — схема для Supabase.
-- Выполнить целиком в SQL Editor проекта Supabase.

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  mood smallint check (mood between 1 and 5),
  cried boolean not null default false,
  trigger_note text,
  good_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entries_user_day_key unique (user_id, day)
);

alter table public.entries enable row level security;

drop policy if exists "entries_select_own" on public.entries;
create policy "entries_select_own"
  on public.entries for select
  using (auth.uid() = user_id);

drop policy if exists "entries_insert_own" on public.entries;
create policy "entries_insert_own"
  on public.entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "entries_update_own" on public.entries;
create policy "entries_update_own"
  on public.entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "entries_delete_own" on public.entries;
create policy "entries_delete_own"
  on public.entries for delete
  using (auth.uid() = user_id);

-- Доступ только авторизованным пользователям (RLS всё равно ограничивает строками).
grant select, insert, update, delete on public.entries to authenticated;
revoke all on public.entries from anon;

-- updated_at обновляется автоматически.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists entries_touch_updated_at on public.entries;
create trigger entries_touch_updated_at
  before update on public.entries
  for each row
  execute function public.touch_updated_at();

create index if not exists entries_user_day_idx on public.entries (user_id, day);
