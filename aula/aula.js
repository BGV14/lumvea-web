import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient('https://htojlbttqcggbqussdny.supabase.co', 'sb_publishable_1OlMJBnTzARk-Rbn9U-Ayg_kMp4laPv');
const app = document.querySelector('#app');
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[character]);
let timeout, warningTimeout;
function addGlobalNav() { document.querySelector('.aula-header')?.remove(); const header = document.createElement('header'); header.className = 'aula-header'; header.innerHTML = '<a href="../index.html"><img src="../assets/logos/lumvea-header.png" alt="LUMVEA Educación" /></a><button type="button">Menú</button><nav><a href="../index.html">Inicio</a><a href="../programas.html">Programas</a><a href="../nivel.html">Horarios</a><a href="../metodo.html">Método</a><a href="../aula/">Aula virtual</a><a href="../inscripcion.html">Inscripción</a></nav>'; header.querySelector('button').addEventListener('click', () => header.classList.toggle('is-open')); document.body.prepend(header); }
function protectSession() { clearTimeout(timeout); clearTimeout(warningTimeout); document.querySelector('#session-warning')?.remove(); warningTimeout = setTimeout(() => { const warning = document.createElement('div'); warning.id = 'session-warning'; warning.className = 'session-warning'; warning.innerHTML = '<p>Tu sesión cerrará en 30 segundos por inactividad.</p><button type="button">Extender sesión</button>'; warning.querySelector('button').addEventListener('click', protectSession); document.body.append(warning); }, 150000); timeout = setTimeout(() => supabase.auth.signOut(), 180000); }

function login() {
  addGlobalNav();
  app.innerHTML = `<section class="login"><div class="login-card"><div class="wordmark">LUMVEA EDUCACIÓN</div><h1>Tu aula virtual.</h1><p class="muted">Ingresa con las credenciales entregadas por LUMVEA.</p><form id="login-form"><label>Correo electrónico<input name="email" type="email" autocomplete="email" required /></label><label>Contraseña<input name="password" type="password" autocomplete="current-password" required /></label><p class="error" id="login-error"></p><button class="primary" type="submit">Ingresar al aula</button></form></div></section>`;
  document.querySelector('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const error = document.querySelector('#login-error');
    const { error: authError } = await supabase.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
    error.textContent = authError ? 'No pudimos validar tus credenciales.' : '';
  });
}

async function dashboard(session) {
  const userId = session.user.id;
  const [{ data: profile }, { data: enrollments }, { data: sessions }, { data: materials }] = await Promise.all([
    supabase.from('perfiles').select('nombre_completo, rol').eq('id', userId).single(),
    supabase.from('matriculas_aula').select('estado, cursos_aula(titulo, codigo, nivel, docente)').eq('estudiante_id', userId).eq('estado', 'activa'),
    supabase.from('sesiones_aula').select('titulo, inicia_en, enlace_clase, cursos_aula(titulo, codigo)').gte('inicia_en', new Date().toISOString()).order('inicia_en').limit(1),
    supabase.from('materiales_aula').select('titulo, tipo, enlace, cursos_aula(titulo)').order('publicado_en', { ascending: false }).limit(6),
  ]);
  const name = profile?.nombre_completo || session.user.email;
  const role = profile?.rol || 'estudiante';
  const roleLabel = role === 'administrador' ? 'ADMINISTRACIÓN' : role === 'docente' ? 'DOCENCIA' : 'ESTUDIANTE';
  const next = sessions?.[0];
  const date = next ? new Intl.DateTimeFormat('es-PE', { dateStyle:'full', timeStyle:'short' }).format(new Date(next.inicia_en)) : 'Aún no tienes clases programadas.';
  if (role === 'administrador') {
    app.innerHTML = `<div class="shell"><aside><div class="wordmark">LUMVEA AULA</div><p class="nav-title">ADMINISTRACIÓN</p><a class="nav-item" href="#inicio">Panel administrativo</a><button class="signout" id="signout">Cerrar sesión</button></aside><main class="content" id="inicio"><header class="topbar"><div><p class="eyebrow">ADMINISTRACIÓN DEL AULA</p><h1>Hola, ${escapeHtml(name)}.</h1><p class="muted">Crea cursos, usuarios y asignaciones desde este panel.</p></div><p class="user">Sesión de administración<br>${escapeHtml(session.user.email)}</p></header><section class="grid"><article class="card next"><p class="label">USUARIOS</p><h2>Alumnos, docentes y administradores</h2><p class="muted">Crea cuentas y define sus roles de acceso.</p></article><article class="card courses"><p class="label">CURSOS</p><h2>Organiza la oferta académica</h2><p class="muted">Crea cursos y asigna al docente responsable.</p></article><article class="card materials"><p class="label">ASIGNACIONES</p><h2>Matricula y docencia</h2><p class="muted">Relaciona alumnos y docentes con uno o varios cursos.</p></article></section></main></div>`;
    document.querySelector('#signout').addEventListener('click', () => supabase.auth.signOut());
    protectSession();
    return;
  }
  app.innerHTML = `<div class="shell"><aside><div class="wordmark">LUMVEA AULA</div><p class="nav-title">ESPACIO DE ${roleLabel}</p><a class="nav-item" href="#inicio">${role === 'administrador' ? 'Panel administrativo' : 'Mi inicio'}</a><button class="signout" id="signout">Cerrar sesión</button></aside><main class="content" id="inicio"><header class="topbar"><div><p class="eyebrow">${role === 'administrador' ? 'ADMINISTRACIÓN DEL AULA' : 'MI APRENDIZAJE'}</p><h1>Hola, ${escapeHtml(name)}.</h1><p class="muted">${role === 'administrador' ? 'Gestiona usuarios, cursos y asignaciones.' : 'Aquí encontrarás tus clases y materiales asignados.'}</p></div><p class="user">Sesión de ${roleLabel.toLowerCase()}<br>${escapeHtml(session.user.email)}</p></header><section class="grid"><article class="card next"><p class="label">PRÓXIMA CLASE</p><div class="session"><div><h2>${escapeHtml(next?.titulo || 'Sin clases próximas')}</h2><p class="muted">${escapeHtml(next?.cursos_aula?.titulo || '')}<br>${date}</p></div>${next?.enlace_clase ? `<a class="action" href="${escapeHtml(next.enlace_clase)}" target="_blank" rel="noopener">Ingresar a clase</a>` : ''}</div></article><article class="card courses"><p class="label">MIS CURSOS</p><ul>${enrollments?.length ? enrollments.map(({ cursos_aula: course }) => `<li><strong>${escapeHtml(course.titulo)}</strong><br><span class="muted">${escapeHtml(course.codigo)} · ${escapeHtml(course.docente || 'Docente por asignar')}</span></li>`).join('') : '<li class="muted">Aún no tienes cursos asignados.</li>'}</ul></article><article class="card materials"><p class="label">MATERIALES RECIENTES</p><ul>${materials?.length ? materials.map((material) => `<li><span class="tag">${escapeHtml(material.tipo)}</span><br><a href="${escapeHtml(material.enlace)}" target="_blank" rel="noopener">${escapeHtml(material.titulo)}</a><span class="muted"> · ${escapeHtml(material.cursos_aula?.titulo || '')}</span></li>`).join('') : '<li class="muted">Los materiales aparecerán aquí cuando tu docente los publique.</li>'}</ul></article></section></main></div>`;
  document.querySelector('#signout').addEventListener('click', () => supabase.auth.signOut());
  const sidebar = document.querySelector('aside');
  sidebar.querySelector('.wordmark').innerHTML = '<img src="../assets/logos/lumvea-header.png" alt="LUMVEA Educación" />';
  const menuButton = document.createElement('button');
  menuButton.className = 'nav-toggle';
  menuButton.type = 'button';
  menuButton.textContent = 'Menú';
  menuButton.setAttribute('aria-expanded', 'false');
  document.body.append(menuButton);
  menuButton.addEventListener('click', () => {
    const open = sidebar.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
}

async function render() { const { data: { session } } = await supabase.auth.getSession(); if (session) dashboard(session); else login(); }
supabase.auth.onAuthStateChange((_event, session) => { if (session) dashboard(session); else login(); });
render();
