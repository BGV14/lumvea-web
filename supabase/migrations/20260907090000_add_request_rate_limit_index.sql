create index if not exists solicitudes_celular_created_at_idx
  on public.solicitudes (celular, created_at desc);
