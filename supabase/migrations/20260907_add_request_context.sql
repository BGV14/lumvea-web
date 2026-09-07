alter table public.solicitudes
  add column if not exists curso text,
  add column if not exists origen text not null default 'directo',
  add column if not exists tipo_solicitud text not null default 'Información general';

comment on column public.solicitudes.curso is 'Curso elegido antes de iniciar la solicitud, si aplica.';
comment on column public.solicitudes.origen is 'Paso desde el que se abrió el formulario: directo, nivel, curso, paquete u horario.';
comment on column public.solicitudes.tipo_solicitud is 'Clasificación de la solicitud según las selecciones disponibles.';
