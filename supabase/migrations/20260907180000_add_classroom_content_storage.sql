insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('aula-materiales', 'aula-materiales', false, 20971520, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

alter table public.materiales_aula
  add column archivo_path text;

create policy "Administradores gestionan archivos del aula" on storage.objects
for all to authenticated
using (bucket_id = 'aula-materiales' and (select public.es_administrador_aula()))
with check (bucket_id = 'aula-materiales' and (select public.es_administrador_aula()));

create policy "Estudiantes leen archivos de cursos matriculados" on storage.objects
for select to authenticated
using (
  bucket_id = 'aula-materiales'
  and exists (
    select 1 from public.matriculas_aula
    where curso_id::text = (storage.foldername(name))[1]
      and estudiante_id = (select auth.uid())
      and estado = 'activa'
  )
);

comment on column public.materiales_aula.archivo_path is 'Ruta privada del PDF en el bucket aula-materiales: curso_id/nombre-archivo.pdf.';
