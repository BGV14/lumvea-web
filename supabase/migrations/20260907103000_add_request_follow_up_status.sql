alter table public.solicitudes
  add column estado text not null default 'pendiente',
  add constraint solicitudes_estado_check
    check (estado in ('pendiente', 'contactado', 'inscrito', 'descartado'));

create or replace view public.resumen_solicitudes_diario
with (security_invoker = true) as
select
  (created_at at time zone 'America/Lima')::date as fecha,
  coalesce(nivel, 'sin nivel') as nivel,
  tipo_solicitud,
  coalesce(modalidad, 'sin promoción') as modalidad,
  count(*) as total_solicitudes,
  count(*) filter (where precio_confirmado is not null) as promociones_confirmadas,
  coalesce(sum(bloques), 0) as bloques_confirmados,
  estado
from public.solicitudes
group by 1, 2, 3, 4, 8;

comment on column public.solicitudes.estado is 'Seguimiento manual: pendiente, contactado, inscrito o descartado.';
