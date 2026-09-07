alter table public.solicitudes
  add column updated_at timestamptz not null default now();

create function public.set_solicitudes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger solicitudes_updated_at
before update on public.solicitudes
for each row
execute function public.set_solicitudes_updated_at();

comment on column public.solicitudes.updated_at is 'Fecha de la última actualización de seguimiento.';
