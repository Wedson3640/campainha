create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  telefone text,
  created_at timestamptz not null default now()
);

create table public.residences (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  endereco_apelido text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.doorbells (
  id uuid primary key default gen_random_uuid(),
  residence_id uuid not null references public.residences(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  local text,
  qr_token text unique not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.visitor_calls (
  id uuid primary key default gen_random_uuid(),
  doorbell_id uuid not null references public.doorbells(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'viewed', 'ended', 'expired', 'rejected')),
  visitor_photo_url text,
  visitor_user_agent text,
  visitor_ip_hash text,
  message text,
  created_at timestamptz not null default now(),
  viewed_at timestamptz,
  ended_at timestamptz
);

create table public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text unique not null,
  platform text,
  device_name text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index residences_owner_id_idx on public.residences(owner_id);
create index doorbells_owner_id_idx on public.doorbells(owner_id);
create index doorbells_qr_token_idx on public.doorbells(qr_token);
create index visitor_calls_owner_created_idx on public.visitor_calls(owner_id, created_at desc);
create index visitor_calls_doorbell_created_idx on public.visitor_calls(doorbell_id, created_at desc);
create index device_tokens_owner_id_idx on public.device_tokens(owner_id);

alter table public.profiles enable row level security;
alter table public.residences enable row level security;
alter table public.doorbells enable row level security;
alter table public.visitor_calls enable row level security;
alter table public.device_tokens enable row level security;

create policy "profiles own select" on public.profiles for select using (id = auth.uid());
create policy "profiles own insert" on public.profiles for insert with check (id = auth.uid());
create policy "profiles own update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "residences owner all" on public.residences for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "doorbells owner all" on public.doorbells for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "visitor calls owner select" on public.visitor_calls for select using (owner_id = auth.uid());
create policy "visitor calls owner update" on public.visitor_calls for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "device tokens owner all" on public.device_tokens for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('visitor-photos', 'visitor-photos', false, 2000000, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = false,
    file_size_limit = 2000000,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create policy "anon uploads visitor photos" on storage.objects
for insert to anon
with check (
  bucket_id = 'visitor-photos'
  and (storage.extension(name) in ('jpg', 'jpeg', 'png', 'webp'))
);

create policy "owners read visitor photos" on storage.objects
for select to authenticated
using (
  bucket_id = 'visitor-photos'
  and exists (
    select 1
    from public.visitor_calls vc
    where vc.visitor_photo_url = storage.objects.name
      and vc.owner_id = auth.uid()
  )
);

create or replace function public.get_public_doorbell(token_value text)
returns table (id uuid, nome text, local text, ativo boolean)
language sql
security definer
set search_path = public
as $$
  select d.id, d.nome, d.local, d.ativo
  from public.doorbells d
  where d.qr_token = token_value
    and d.ativo = true
  limit 1;
$$;

create or replace function public.create_visitor_call(
  token_value text,
  photo_path text default null,
  visitor_message text default null,
  visitor_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_doorbell public.doorbells%rowtype;
  recent_count integer;
  created_id uuid;
begin
  select *
  into target_doorbell
  from public.doorbells
  where qr_token = token_value
    and ativo = true
  limit 1;

  if target_doorbell.id is null then
    raise exception 'Campainha inválida ou inativa';
  end if;

  select count(*)
  into recent_count
  from public.visitor_calls
  where doorbell_id = target_doorbell.id
    and created_at > now() - interval '30 seconds'
    and status in ('pending', 'viewed');

  if recent_count >= 3 then
    raise exception 'Muitas chamadas em pouco tempo. Aguarde alguns segundos.';
  end if;

  if photo_path is not null and photo_path !~ '^[a-zA-Z0-9/_-]+\.(jpg|jpeg|png|webp)$' then
    raise exception 'Imagem inválida';
  end if;

  insert into public.visitor_calls (
    doorbell_id,
    owner_id,
    visitor_photo_url,
    visitor_user_agent,
    message
  )
  values (
    target_doorbell.id,
    target_doorbell.owner_id,
    photo_path,
    left(visitor_agent, 500),
    nullif(left(regexp_replace(coalesce(visitor_message, ''), '[<>]', '', 'g'), 240), '')
  )
  returning id into created_id;

  return created_id;
end;
$$;

grant execute on function public.get_public_doorbell(text) to anon, authenticated;
grant execute on function public.create_visitor_call(text, text, text, text) to anon, authenticated;

alter publication supabase_realtime add table public.visitor_calls;
