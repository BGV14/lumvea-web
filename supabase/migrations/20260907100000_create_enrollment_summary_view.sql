create or replace view public.resumen_solicitudes_diario
with (security_invoker = true) as
select
  (created_at at time zone 'America/Lima')::date as fecha,
  coalesce(nivel, 'sin nivel') as nivel,
  tipo_solicitud,
  coalesce(modalidad, 'sin promoción') as modalidad,
  count(*) as total_solicitudes,
  count(*) filter (where precio_confirmado is not null) as promociones_confirmadas,
  coalesce(sum(bloques), 0) as bloques_confirmados
from public.solicitudes
group by 1, 2, 3, 4;

revoke all on public.resumen_solicitudes_diario from anon, authenticated;

comment on view public.resumen_solicitudes_diario is 'Resumen diario de solicitudes para reportes operativos, sin datos personales.';
