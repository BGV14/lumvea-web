create table public.perfiles (
  id uuid primary key references auth.users on delete cascade,
  nombre_completo text,
  rol text not null default 'estudiante' check (rol in ('estudiante', 'docente', 'administrador')),
  created_at timestamptz not null default now()
);

create table public.cursos_aula (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  titulo text not null,
  nivel text not null check (nivel in ('primaria', 'secundaria', 'preuniversitaria')),
  docente text,
  descripcion text,
  created_at timestamptz not null default now()
);

create table public.matriculas_aula (
  estudiante_id uuid not null references public.perfiles on delete cascade,
  curso_id uuid not null references public.cursos_aula on delete cascade,
  estado text not null default 'activa' check (estado in ('activa', 'pausada', 'finalizada')),
  created_at timestamptz not null default now(),
  primary key (estudiante_id, curso_id)
);

create table public.sesiones_aula (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos_aula on delete cascade,
  titulo text not null,
  inicia_en timestamptz not null,
  enlace_clase text,
  created_at timestamptz not null default now()
);

create table public.materiales_aula (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos_aula on delete cascade,
  titulo text not null,
  tipo text not null default 'Material' check (tipo in ('Material', 'Práctica', 'Video', 'Simulacro')),
  enlace text not null,
  publicado_en timestamptz not null default now()
);

create function public.crear_perfil_aula()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre_completo)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger crear_perfil_aula_al_registrar
after insert on auth.users
for each row execute function public.crear_perfil_aula();

insert into public.perfiles (id, nombre_completo)
select id, nullif(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (id) do nothing;

alter table public.perfiles enable row level security;
alter table public.cursos_aula enable row level security;
alter table public.matriculas_aula enable row level security;
alter table public.sesiones_aula enable row level security;
alter table public.materiales_aula enable row level security;

create policy "Estudiantes ven su perfil" on public.perfiles
for select to authenticated using ((select auth.uid()) = id);

create policy "Estudiantes ven sus matriculas" on public.matriculas_aula
for select to authenticated using ((select auth.uid()) = estudiante_id);

create policy "Estudiantes ven cursos matriculados" on public.cursos_aula
for select to authenticated using (
  exists (select 1 from public.matriculas_aula where curso_id = cursos_aula.id and estudiante_id = (select auth.uid()) and estado = 'activa')
);

create policy "Estudiantes ven sesiones de sus cursos" on public.sesiones_aula
for select to authenticated using (
  exists (select 1 from public.matriculas_aula where curso_id = sesiones_aula.curso_id and estudiante_id = (select auth.uid()) and estado = 'activa')
);

create policy "Estudiantes ven materiales de sus cursos" on public.materiales_aula
for select to authenticated using (
  exists (select 1 from public.matriculas_aula where curso_id = materiales_aula.curso_id and estudiante_id = (select auth.uid()) and estado = 'activa')
);

create index matriculas_aula_estudiante_idx on public.matriculas_aula (estudiante_id, estado);
create index sesiones_aula_curso_inicio_idx on public.sesiones_aula (curso_id, inicia_en);
create index materiales_aula_curso_publicacion_idx on public.materiales_aula (curso_id, publicado_en desc);
