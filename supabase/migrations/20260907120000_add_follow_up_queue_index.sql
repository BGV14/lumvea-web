create index if not exists solicitudes_estado_updated_at_idx
  on public.solicitudes (estado, updated_at desc);
