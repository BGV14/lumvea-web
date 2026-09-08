import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const allowedOrigins = ['https://lumvea-web.vercel.app', 'https://lumvea-aula-virtual.vercel.app'];
const headers = (request: Request) => ({ 'Access-Control-Allow-Origin': allowedOrigins.includes(request.headers.get('origin') ?? '') ? request.headers.get('origin')! : allowedOrigins[0], 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json' });

Deno.serve(async (request) => {
  const corsHeaders = headers(request);
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { data: auth, error: authError } = await admin.auth.getUser(token);
    if (authError || !auth.user) return new Response(JSON.stringify({ error: 'Sesión inválida.' }), { status: 401, headers: corsHeaders });
    const { data: profile } = await admin.from('perfiles').select('rol').eq('id', auth.user.id).single();
    if (profile?.rol !== 'administrador') return new Response(JSON.stringify({ error: 'No autorizado.' }), { status: 403, headers: corsHeaders });
    const { nombre_completo, email, rol } = await request.json();
    if (!nombre_completo || !email || !['estudiante', 'docente', 'administrador'].includes(rol)) return new Response(JSON.stringify({ error: 'Datos inválidos.' }), { status: 400, headers: corsHeaders });
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name: nombre_completo }, redirectTo: 'https://lumvea-aula-virtual.vercel.app' });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    const { error: profileError } = await admin.from('perfiles').upsert({ id: data.user.id, nombre_completo, rol });
    if (profileError) return new Response(JSON.stringify({ error: 'No se pudo asignar el rol del usuario invitado.' }), { status: 500, headers: corsHeaders });
    return Response.json({ ok: true, id: data.user.id }, { headers: corsHeaders });
  } catch { return new Response(JSON.stringify({ error: 'No se pudo enviar la invitación.' }), { status: 500, headers: corsHeaders }); }
});
