create table public.docencias_aula (
  docente_id uuid not null references public.perfiles on delete cascade,
  curso_id uuid not null references public.cursos_aula on delete cascade,
  created_at timestamptz not null default now(),
  primary key (docente_id, curso_id)
);

alter table public.docencias_aula enable row level security;

create policy "Administradores gestionan docencias" on public.docencias_aula
for all to authenticated using ((select public.es_administrador_aula())) with check ((select public.es_administrador_aula()));

create index docencias_aula_docente_idx on public.docencias_aula (docente_id);
