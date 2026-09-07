alter table public.solicitudes
  add constraint solicitudes_modalidad_check
    check (modalidad is null or modalidad in ('weekly', 'monthly')),
  add constraint solicitudes_bloques_check
    check (bloques is null or bloques > 0);
