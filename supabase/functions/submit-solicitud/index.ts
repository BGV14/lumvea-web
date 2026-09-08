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

const packageCatalog = {
  primaria: [
    ['Paquete Matemático', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Geometría'], 15, 45], ['Paquete Comunicación', ['Lenguaje', 'Comprensión Lectora', 'Razonamiento Verbal'], 9, 27], ['Paquete Ciencias Naturales + Ciencias Sociales', ['Ciencia y Tecnología', 'Personal Social'], 3, 9], ['Paquete Inglés', ['Inglés'], 3, 9], ['Paquete Matemático + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Geometría', 'Inglés'], 21, 63], ['Paquete Comunicación + Inglés', ['Lenguaje', 'Comprensión Lectora', 'Razonamiento Verbal', 'Inglés'], 15, 45], ['Paquete Ciencias Naturales + Ciencias Sociales + Inglés', ['Ciencia y Tecnología', 'Personal Social', 'Inglés'], 9, 27], ['Paquete Matemático + Comunicación + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Geometría', 'Lenguaje', 'Comprensión Lectora', 'Razonamiento Verbal', 'Inglés'], 33, 99], ['Paquete Matemático + Ciencias Naturales + Ciencias Sociales + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Geometría', 'Ciencia y Tecnología', 'Personal Social', 'Inglés'], 33, 99], ['Paquete Comunicación + Ciencias Naturales + Ciencias Sociales + Inglés', ['Lenguaje', 'Comprensión Lectora', 'Razonamiento Verbal', 'Ciencia y Tecnología', 'Personal Social', 'Inglés'], 21, 63], ['Paquete Completo', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Geometría', 'Lenguaje', 'Comprensión Lectora', 'Razonamiento Verbal', 'Ciencia y Tecnología', 'Personal Social', 'Inglés'], 39, 117],
  ],
  secundaria: [
    ['Paquete Matemático', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría'], 21, 63], ['Paquete Comunicación', ['Lenguaje', 'Literatura', 'Razonamiento Verbal'], 6, 18], ['Paquete Ciencias Naturales', ['Física', 'Química', 'Biología'], 15, 45], ['Paquete Inglés', ['Inglés'], null, 9], ['Paquete Matemático + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Inglés'], 24, 72], ['Paquete Comunicación + Inglés', ['Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Inglés'], 9, 27], ['Paquete Ciencias Naturales + Inglés', ['Física', 'Química', 'Biología', 'Inglés'], 18, 54], ['Paquete Matemático + Comunicación + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Inglés'], 33, 99], ['Paquete Matemático + Ciencias Naturales + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Física', 'Química', 'Biología', 'Inglés'], 42, 126], ['Paquete Ciencias Naturales + Comunicación + Inglés', ['Física', 'Química', 'Biología', 'Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Inglés'], 27, 81], ['Paquete Completo', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Física', 'Química', 'Biología', 'Inglés'], 51, 153],
  ],
  preuniversitaria: [
    ['Paquete Matemático', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría'], 24, 72], ['Paquete Comunicación', ['Lenguaje', 'Literatura', 'Razonamiento Verbal'], 8, 24], ['Paquete Ciencias Sociales', ['Psicología', 'Educación Cívica', 'Historia del Perú', 'Historia Universal', 'Geografía', 'Economía', 'Filosofía'], 24, 72], ['Paquete Ciencias Naturales', ['Física', 'Química', 'Biología'], 20, 60], ['Paquete Inglés', ['Inglés'], null, 12], ['Paquete Matemático + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Inglés'], 28, 84], ['Paquete Comunicación + Inglés', ['Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Inglés'], 12, 36], ['Paquete Ciencias Sociales + Inglés', ['Psicología', 'Educación Cívica', 'Historia del Perú', 'Historia Universal', 'Geografía', 'Economía', 'Filosofía', 'Inglés'], 28, 84], ['Paquete Ciencias Naturales + Inglés', ['Física', 'Química', 'Biología', 'Inglés'], 24, 72], ['Paquete Matemático + Comunicación + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Inglés'], 40, 120], ['Paquete Matemático + Ciencias Naturales + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Física', 'Química', 'Biología', 'Inglés'], 52, 156], ['Paquete Ciencias Naturales + Comunicación + Inglés', ['Física', 'Química', 'Biología', 'Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Inglés'], 36, 108], ['Paquete Completo', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Psicología', 'Educación Cívica', 'Historia del Perú', 'Historia Universal', 'Geografía', 'Economía', 'Filosofía', 'Física', 'Química', 'Biología', 'Inglés'], 92, 276],
  ],
} as const;

function officialPackage(level: keyof typeof packageCatalog, packageName: string, courseText: string, cadence: string) {
  const packageEntry = packageCatalog[level].find(([name]) => name === packageName);
  if (!packageEntry) return null;
  const [name, catalogCourses, weeklyPrice, monthlyPrice] = packageEntry;
  const courses = courseText.split(',').map((course) => course.trim()).filter(Boolean);
  if (courses.length !== catalogCourses.length || [...courses].sort().join('|') !== [...catalogCourses].sort().join('|')) throw new Error('Cursos inválidos para el paquete.');
  const confirmedCadence = weeklyPrice === null ? 'monthly' : cadence === 'monthly' ? 'monthly' : 'weekly';
  const price = confirmedCadence === 'weekly' ? weeklyPrice : monthlyPrice;
  return { courses: [...catalogCourses], blocks: null, packageName: name, price: `S/ ${price} / ${confirmedCadence === 'weekly' ? 'semana' : 'mes'}`, cadence: confirmedCadence };
}

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
  const weeklyOffer = weeklyRegular - rate;
  const monthlyRegular = weeklyRegular * 4;
  const monthlyOffer = monthlyRegular - rate;
  if (uniqueCourses.length === 1) {
    return { courses: uniqueCourses, blocks, packageName: 'Promoción mensual personalizada', price: `S/ ${monthlyOffer} / mes`, cadence: 'monthly' };
  }
  if (!['weekly', 'monthly'].includes(cadence)) throw new Error('Modalidad inválida.');
  return cadence === 'weekly'
    ? { courses: uniqueCourses, blocks, packageName: 'Promoción semanal personalizada', price: `S/ ${weeklyOffer} / semana`, cadence }
    : { courses: uniqueCourses, blocks, packageName: 'Promoción mensual personalizada', price: `S/ ${monthlyOffer} / mes`, cadence };
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
    if (modalidad && !['weekly', 'monthly'].includes(modalidad)) {
      return new Response(JSON.stringify({ error: 'Modalidad inválida.' }), { status: 400, headers });
    }
    if (turno && !['Turno mañana', 'Turno tarde / noche'].includes(turno)) {
      return new Response(JSON.stringify({ error: 'Turno inválido.' }), { status: 400, headers });
    }
    let promotion: ReturnType<typeof calculatePromotion> | ReturnType<typeof officialPackage> = null;
    try {
      if (nivel && curso) {
        const confirmedPackage = paquete ? officialPackage(nivel as keyof typeof packageCatalog, paquete, curso, modalidad) : null;
        if (paquete && !confirmedPackage && !paquete.startsWith('Promoción ')) throw new Error('Paquete inválido.');
        promotion = confirmedPackage || calculatePromotion(nivel as keyof typeof courseBlocks, curso, modalidad);
      }
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
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: limitError } = await supabase
      .from('solicitudes')
      .select('*', { count: 'exact', head: true })
      .eq('celular', celular)
      .gte('created_at', oneHourAgo);
    if (limitError) throw limitError;
    if ((count ?? 0) >= 10) {
      return new Response(JSON.stringify({ error: 'Ya recibimos varias solicitudes desde este celular. Intenta nuevamente en una hora.' }), { status: 429, headers });
    }
    const { error } = await supabase.from('solicitudes').insert({
      nombre_completo: nombreCompleto,
      celular,
      nivel: nivel || null,
      curso: promotion ? promotion.courses.join(', ') : curso || null,
      paquete: promotion ? `${promotion.packageName} · ${promotion.price}` : paquete || null,
      precio_confirmado: promotion?.price || null,
      modalidad: promotion?.cadence || null,
      bloques: promotion?.blocks || null,
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
