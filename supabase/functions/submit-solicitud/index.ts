import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') ?? 'https://lumvea-web.vercel.app';

function corsHeaders(request: Request) {
  const requestOrigin = request.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': requestOrigin === allowedOrigin ? requestOrigin : allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function text(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function classifyRequest(level: string, course: string, packageName: string, turn: string) {
  if (level && course && packageName && turn) return 'Inscripción completa';
  if (packageName && turn) return 'Consulta por paquete y horario';
  if (packageName) return 'Consulta por paquete';
  if (turn) return 'Consulta por horario';
  if (course) return 'Consulta por curso';
  if (level) return 'Consulta por nivel';
  return 'Información general';
}

serve(async (request) => {
  const headers = corsHeaders(request);
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Método no permitido.' }), { status: 405, headers });

  try {
    const body = await request.json();
    const nombreCompleto = text(body.nombre_completo, 120);
    const celular = text(body.celular, 9);
    const nivel = text(body.nivel, 40).toLowerCase();
    const curso = text(body.curso, 100);
    const paquete = text(body.paquete, 100);
    const turno = text(body.turno, 40);
    const origen = ['directo', 'inicio', 'nivel', 'curso', 'paquete', 'horario'].includes(text(body.origen, 20)) ? text(body.origen, 20) : 'directo';
    const turnstileToken = text(body.turnstile_token, 4096);

    if (!nombreCompleto || !/^9\d{8}$/.test(celular) || !turnstileToken) {
      return new Response(JSON.stringify({ error: 'Datos de solicitud inválidos.' }), { status: 400, headers });
    }
    if (nivel && !['primaria', 'secundaria', 'preuniversitaria'].includes(nivel)) {
      return new Response(JSON.stringify({ error: 'Nivel inválido.' }), { status: 400, headers });
    }
    if (turno && !['Turno mañana', 'Turno tarde / noche'].includes(turno)) {
      return new Response(JSON.stringify({ error: 'Turno inválido.' }), { status: 400, headers });
    }

    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: Deno.env.get('TURNSTILE_SECRET_KEY') ?? '',
        response: turnstileToken,
      }),
    });
    const turnstileResult = await turnstileResponse.json();
    if (!turnstileResult.success) {
      return new Response(JSON.stringify({ error: 'Verificación de seguridad inválida.' }), { status: 400, headers });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    const { error } = await supabase.from('solicitudes').insert({
      nombre_completo: nombreCompleto,
      celular,
      nivel: nivel || null,
      curso: curso || null,
      paquete: paquete || null,
      turno: turno || null,
      origen,
      tipo_solicitud: classifyRequest(nivel, curso, paquete, turno),
    });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), { status: 201, headers });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'No se pudo guardar la solicitud.' }), { status: 500, headers });
  }
});
