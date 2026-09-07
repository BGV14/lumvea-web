create function public.es_administrador_aula()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol = 'administrador'
  );
$$;

create policy "Administradores ven perfiles" on public.perfiles
for select to authenticated using ((select public.es_administrador_aula()));
create policy "Administradores actualizan perfiles" on public.perfiles
for update to authenticated using ((select public.es_administrador_aula())) with check ((select public.es_administrador_aula()));

create policy "Administradores gestionan cursos" on public.cursos_aula
for all to authenticated using ((select public.es_administrador_aula())) with check ((select public.es_administrador_aula()));
create policy "Administradores gestionan matriculas" on public.matriculas_aula
for all to authenticated using ((select public.es_administrador_aula())) with check ((select public.es_administrador_aula()));
create policy "Administradores gestionan sesiones" on public.sesiones_aula
for all to authenticated using ((select public.es_administrador_aula())) with check ((select public.es_administrador_aula()));
create policy "Administradores gestionan materiales" on public.materiales_aula
for all to authenticated using ((select public.es_administrador_aula())) with check ((select public.es_administrador_aula()));
