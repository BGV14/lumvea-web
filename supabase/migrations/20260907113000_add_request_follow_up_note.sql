alter table public.solicitudes
  add column nota_seguimiento text;

comment on column public.solicitudes.nota_seguimiento is 'Notas internas de seguimiento manual por WhatsApp.';
