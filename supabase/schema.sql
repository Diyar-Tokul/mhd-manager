-- MHD-Manager: Datenbank
-- Im Supabase SQL-Editor ausführen

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null default 'mitarbeiter' check (role in ('mitarbeiter', 'admin'))
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  quantity integer not null default 0 check (quantity >= 0),
  expiry_date date not null,
  article_number text,
  status text not null default 'aktiv' check (status in ('aktiv', 'reduziert', 'verkauft', 'entsorgt')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Schnellere Sortierung/Filterung nach MHD und Status
create index products_expiry_idx on products (expiry_date);
create index products_status_idx on products (status);

-- updated_at automatisch setzen
create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at before update on products
for each row execute function set_updated_at();

-- Profil beim Registrieren automatisch anlegen
create function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, name) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
for each row execute function handle_new_user();

-- Row Level Security
alter table profiles enable row level security;
alter table products enable row level security;

create policy "Eigenes Profil lesen" on profiles
  for select to authenticated using (auth.uid() = id);

create policy "Produkte lesen" on products
  for select to authenticated using (true);
create policy "Produkte anlegen" on products
  for insert to authenticated with check (true);
create policy "Produkte bearbeiten" on products
  for update to authenticated using (true);
create policy "Produkte löschen nur Admin" on products
  for delete to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Admin festlegen (E-Mail anpassen):
-- update profiles set role = 'admin' where name = 'chef@markt.de';

-- Testdaten (optional)
insert into products (name, category, quantity, expiry_date, status) values
  ('Milch 1,5 %', 'Milchprodukte', 15, current_date + 6, 'aktiv'),
  ('Joghurt Natur', 'Milchprodukte', 20, current_date + 2, 'aktiv'),
  ('Túró Rudi', 'Milchprodukte', 30, current_date + 10, 'aktiv'),
  ('Pick Salami', 'Wurst', 8, current_date + 40, 'aktiv'),
  ('Kolbász', 'Wurst', 5, current_date, 'aktiv'),
  ('Toastbrot', 'Backwaren', 12, current_date - 1, 'reduziert');
