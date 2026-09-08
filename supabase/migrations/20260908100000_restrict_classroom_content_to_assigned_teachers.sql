drop policy if exists "Administradores gestionan sesiones" on public.sesiones_aula;
drop policy if exists "Administradores gestionan materiales" on public.materiales_aula;
drop policy if exists "Administradores gestionan archivos del aula" on storage.objects;

create policy "Docentes ven sus docencias" on public.docencias_aula
for select to authenticated
using ((select auth.uid()) = docente_id);

create policy "Docentes ven sus cursos asignados" on public.cursos_aula
for select to authenticated
using (
  exists (
    select 1 from public.docencias_aula
    where curso_id = cursos_aula.id
      and docente_id = (select auth.uid())
  )
);

create policy "Docentes ven materiales de sus cursos" on public.materiales_aula
for select to authenticated
using (
  exists (
    select 1 from public.docencias_aula
    where curso_id = materiales_aula.curso_id
      and docente_id = (select auth.uid())
  )
);

create policy "Docentes crean materiales de sus cursos" on public.materiales_aula
for insert to authenticated
with check (
  exists (
    select 1 from public.docencias_aula
    where curso_id = materiales_aula.curso_id
      and docente_id = (select auth.uid())
  )
);

create policy "Docentes actualizan materiales de sus cursos" on public.materiales_aula
for update to authenticated
using (
  exists (
    select 1 from public.docencias_aula
    where curso_id = materiales_aula.curso_id
      and docente_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.docencias_aula
    where curso_id = materiales_aula.curso_id
      and docente_id = (select auth.uid())
  )
);

create policy "Docentes eliminan materiales de sus cursos" on public.materiales_aula
for delete to authenticated
using (
  exists (
    select 1 from public.docencias_aula
    where curso_id = materiales_aula.curso_id
      and docente_id = (select auth.uid())
  )
);

create policy "Docentes ven sesiones de sus cursos" on public.sesiones_aula
for select to authenticated
using (
  exists (
    select 1 from public.docencias_aula
    where curso_id = sesiones_aula.curso_id
      and docente_id = (select auth.uid())
  )
);

create policy "Docentes crean sesiones de sus cursos" on public.sesiones_aula
for insert to authenticated
with check (
  exists (
    select 1 from public.docencias_aula
    where curso_id = sesiones_aula.curso_id
      and docente_id = (select auth.uid())
  )
);

create policy "Docentes actualizan sesiones de sus cursos" on public.sesiones_aula
for update to authenticated
using (
  exists (
    select 1 from public.docencias_aula
    where curso_id = sesiones_aula.curso_id
      and docente_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.docencias_aula
    where curso_id = sesiones_aula.curso_id
      and docente_id = (select auth.uid())
  )
);

create policy "Docentes eliminan sesiones de sus cursos" on public.sesiones_aula
for delete to authenticated
using (
  exists (
    select 1 from public.docencias_aula
    where curso_id = sesiones_aula.curso_id
      and docente_id = (select auth.uid())
  )
);

create policy "Docentes gestionan archivos de sus cursos" on storage.objects
for all to authenticated
using (
  bucket_id = 'aula-materiales'
  and exists (
    select 1 from public.docencias_aula
    where curso_id::text = (storage.foldername(name))[1]
      and docente_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'aula-materiales'
  and exists (
    select 1 from public.docencias_aula
    where curso_id::text = (storage.foldername(name))[1]
      and docente_id = (select auth.uid())
  )
);
