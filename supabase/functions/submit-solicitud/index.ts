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

const courseBlocks = {
  primaria: { 'Razonamiento Matemático': 1, Aritmética: 2, Álgebra: 1, Geometría: 2, Lenguaje: 2, 'Comprensión Lectora': 2, 'Razonamiento Verbal': 1, 'Personal Social': 1, 'Ciencia y Tecnología': 1, Inglés: 2 },
  secundaria: { 'Razonamiento Matemático': 2, Aritmética: 2, Álgebra: 1, Trigonometría: 1, Geometría: 2, Lenguaje: 1, Literatura: 1, 'Razonamiento Verbal': 1, Física: 2, Química: 2, Biología: 2, Inglés: 1 },
  preuniversitaria: { 'Razonamiento Matemático': 1, Aritmética: 2, Álgebra: 1, Trigonometría: 1, Geometría: 2, Lenguaje: 1, Literatura: 1, 'Razonamiento Verbal': 1, Psicología: 1, 'Educación Cívica': 1, 'Historia del Perú': 1, 'Historia Universal': 1, Geografía: 1, Economía: 1, Filosofía: 1, Física: 2, Química: 2, Biología: 2, Inglés: 1 },
} as const;

function calculatePromotion(level: keyof typeof courseBlocks, courseText: string, cadence: string) {
  const courses = courseText.split(',').map((course) => course.trim()).filter(Boolean);
  const uniqueCourses = [...new Set(courses)];
  const catalog = courseBlocks[level];
  if (courses.length !== uniqueCourses.length || !uniqueCourses.every((course) => course in catalog)) {
    throw new Error('Cursos inválidos.');
  }
  const blocks = uniqueCourses.reduce((total, course) => total + catalog[course as keyof typeof catalog], 0);
  const rate = level === 'preuniversitaria' ? 4 : 3;
  const weeklyRegular = blocks * rate;
  if (uniqueCourses.length === 1) {
    return { courses: uniqueCourses, packageName: 'Promoción mensual personalizada', price: `S/ ${weeklyRegular * 3} / mes`, cadence: 'monthly' };
  }
  if (blocks < 3) throw new Error('La combinación debe tener al menos 3 bloques.');
  if (!['weekly', 'monthly'].includes(cadence)) throw new Error('Modalidad inválida.');
  const weeklyOffer = weeklyRegular - rate;
  return cadence === 'weekly'
    ? { courses: uniqueCourses, packageName: 'Promoción semanal personalizada', price: `S/ ${weeklyOffer} / semana`, cadence }
    : { courses: uniqueCourses, packageName: 'Promoción mensual personalizada', price: `S/ ${weeklyOffer * 3} / mes`, cadence };
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
    const curso = text(body.curso, 500);
    const paquete = text(body.paquete, 100);
    const modalidad = text(body.modalidad, 20);
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
    let promotion: ReturnType<typeof calculatePromotion> | null = null;
    try {
      promotion = nivel && curso ? calculatePromotion(nivel as keyof typeof courseBlocks, curso, modalidad) : null;
    } catch (error) {
      return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Promoción inválida.' }), { status: 400, headers });
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
      curso: promotion ? promotion.courses.join(', ') : curso || null,
      paquete: promotion ? `${promotion.packageName} · ${promotion.price}` : paquete || null,
      turno: turno || null,
      origen,
      tipo_solicitud: classifyRequest(nivel, promotion ? promotion.courses.join(', ') : curso, promotion?.packageName || paquete, turno),
    });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, solicitud: promotion }), { status: 201, headers });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'No se pudo guardar la solicitud.' }), { status: 500, headers });
  }
});
