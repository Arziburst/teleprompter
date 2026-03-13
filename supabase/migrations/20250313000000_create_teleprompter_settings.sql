create table if not exists public.teleprompter_settings (
  id text primary key default 'default',
  text text not null default '',
  duration_minutes numeric not null default 3 check (duration_minutes >= 0.5 and duration_minutes <= 60),
  speed numeric not null default 1 check (speed >= 0.1 and speed <= 5),
  font_size integer not null default 40 check (font_size >= 20 and font_size <= 96),
  theme text not null default 'light' check (theme in ('light', 'dark')),
  updated_at timestamptz not null default now()
);

alter table public.teleprompter_settings enable row level security;

create policy "Allow read and write for all"
  on public.teleprompter_settings
  for all
  using (true)
  with check (true);

insert into public.teleprompter_settings (id, text, duration_minutes, speed, font_size, theme)
values ('default', '', 3, 1, 40, 'light')
on conflict (id) do nothing;

alter publication supabase_realtime add table public.teleprompter_settings;
