alter table public.solicitudes
  add column if not exists precio_confirmado text,
  add column if not exists modalidad text,
  add column if not exists bloques integer;

comment on column public.solicitudes.precio_confirmado is 'Precio de promoción calculado y confirmado por la Edge Function.';
comment on column public.solicitudes.modalidad is 'Modalidad confirmada: weekly o monthly.';
comment on column public.solicitudes.bloques is 'Cantidad total de bloques semanales incluidos en la selección.';
