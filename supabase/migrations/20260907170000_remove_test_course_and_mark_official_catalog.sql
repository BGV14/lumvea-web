alter table public.cursos_aula
  add column es_oficial boolean not null default false;

update public.cursos_aula
set es_oficial = true
where codigo = any (array[
  'MATA-01', 'MATA-02', 'MATA-03', 'MATA-04', 'MATA-05',
  'LENA-01', 'LENA-02', 'LENA-03',
  'SOCA-01', 'SOCA-02', 'SOCA-03', 'SOCA-04', 'SOCA-05', 'SOCA-06', 'SOCA-07',
  'NATA-01', 'NATA-02', 'NATA-03', 'INGA-01',
  'MATS-01', 'MATS-02', 'MATS-03', 'MATS-04', 'MATS-05',
  'LENS-01', 'LENS-02', 'LENS-03',
  'NATS-01', 'NATS-02', 'NATS-03', 'INGS-01',
  'MATP-01', 'MATP-02', 'MATP-03', 'MATP-04',
  'LENP-01', 'LENP-02', 'LENP-03', 'SOCP-01', 'NATP-01', 'INGP-01'
]);

-- Delete dependents explicitly so this cleanup also remains valid if FK actions change.
delete from public.materiales_aula
where curso_id in (select id from public.cursos_aula where codigo = 'MAT-PRUEBA');

delete from public.sesiones_aula
where curso_id in (select id from public.cursos_aula where codigo = 'MAT-PRUEBA');

delete from public.matriculas_aula
where curso_id in (select id from public.cursos_aula where codigo = 'MAT-PRUEBA');

delete from public.docencias_aula
where curso_id in (select id from public.cursos_aula where codigo = 'MAT-PRUEBA');

delete from public.cursos_aula
where codigo = 'MAT-PRUEBA';
