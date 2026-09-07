import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient('https://htojlbttqcggbqussdny.supabase.co', 'sb_publishable_1OlMJBnTzARk-Rbn9U-Ayg_kMp4laPv');
const app = document.querySelector('#app');
const roles = ['estudiante', 'docente', 'administrador'];
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
let timeout, warningTimeout, countdown;
let adminState = { view: 'usuarios', courseLevel: 'all', currentUserId: '', profiles: [], courses: [], enrollments: [], teachings: [] };

function addGlobalNav() {
  document.querySelector('.aula-public-header')?.remove();
  const header = document.createElement('header');
  header.className = 'site-header aula-public-header';
  header.innerHTML = '<a class="brand-logo" href="../index.html"><img src="../assets/logos/lumvea-header.png" alt="LUMVEA Educación" /></a><button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav"><span class="sr-only">Abrir menu</span><span aria-hidden="true">Menu</span></button><nav id="site-nav" class="site-nav" aria-label="Navegacion principal"><a href="../index.html">Inicio</a><a href="../programas.html">Programas</a><a href="../nivel.html">Horarios</a><a href="../metodo.html">Método</a><a class="nav-active" href="../aula/">Aula virtual</a><a href="../inscripcion.html">Inscripción</a></nav>';
  header.querySelector('button').addEventListener('click', () => {
    const navigation = header.querySelector('.site-nav');
    const open = navigation.classList.toggle('is-open');
    header.querySelector('button').setAttribute('aria-expanded', String(open));
  });
  header.querySelectorAll('.site-nav a').forEach((link) => link.addEventListener('click', () => {
    header.querySelector('.site-nav').classList.remove('is-open');
    header.querySelector('button').setAttribute('aria-expanded', 'false');
  }));
  document.body.prepend(header);
}

function protectSession() {
  clearTimeout(timeout);
  clearTimeout(warningTimeout);
  clearInterval(countdown);
  document.querySelector('#session-warning')?.remove();
  warningTimeout = setTimeout(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    let seconds = 30;
    const warning = document.createElement('div');
    warning.id = 'session-warning';
    warning.className = 'session-warning';
    warning.innerHTML = `<p>Tu sesión cerrará en <strong>${seconds}</strong> segundos por inactividad.</p><button type="button">Extender sesión</button>`;
    warning.querySelector('button').addEventListener('click', protectSession);
    document.body.append(warning);
    countdown = setInterval(() => {
      seconds -= 1;
      const count = warning.querySelector('strong');
      if (count) count.textContent = String(seconds);
    }, 1000);
  }, 150000);
  timeout = setTimeout(() => supabase.auth.signOut(), 180000);
}

function login() {
  clearTimeout(timeout);
  clearTimeout(warningTimeout);
  clearInterval(countdown);
  document.querySelector('#session-warning')?.remove();
  addGlobalNav();
  app.innerHTML = `<section class="login"><div class="login-card"><div class="wordmark">LUMVEA EDUCACIÓN</div><h1>Tu aula virtual.</h1><p class="muted">Ingresa con las credenciales entregadas por LUMVEA.</p><form id="login-form"><label>Correo electrónico<input name="email" type="email" autocomplete="email" required /></label><label>Contraseña<input name="password" type="password" autocomplete="current-password" required /></label><p class="error" id="login-error" role="alert"></p><button class="primary" type="submit">Ingresar al aula</button></form></div></section>`;
  document.querySelector('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const error = document.querySelector('#login-error');
    const { error: authError } = await supabase.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
    error.textContent = authError ? 'No pudimos validar tus credenciales.' : '';
  });
}

function optionList(items, label) {
  return items.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(label(item))}</option>`).join('');
}

function adminStatus(message = '', tone = 'success') {
  const status = document.querySelector('#admin-status');
  if (!status) return;
  status.textContent = message;
  status.dataset.tone = tone;
}

function setSubmitting(form, submitting) {
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  button.disabled = submitting;
  button.dataset.label ||= button.textContent;
  button.textContent = submitting ? 'Guardando...' : button.dataset.label;
}

async function loadAdminData() {
  const [profiles, courses, enrollments, teachings] = await Promise.all([
    supabase.from('perfiles').select('id, nombre_completo, rol, created_at').order('nombre_completo'),
    supabase.from('cursos_aula').select('id, codigo, titulo, nivel, descripcion, es_oficial, created_at').order('titulo'),
    supabase.from('matriculas_aula').select('estudiante_id, curso_id, estado, created_at').order('created_at', { ascending: false }),
    supabase.from('docencias_aula').select('docente_id, curso_id, created_at').order('created_at', { ascending: false }),
  ]);
  const error = [profiles, courses, enrollments, teachings].find((result) => result.error)?.error;
  if (error) throw error;
  adminState = { ...adminState, profiles: profiles.data || [], courses: courses.data || [], enrollments: enrollments.data || [], teachings: teachings.data || [] };
}

function adminUsersView() {
  const rows = adminState.profiles.map((profile) => {
    const roleControl = profile.id === adminState.currentUserId
      ? '<span class="status-badge">Administrador actual</span>'
      : `<form class="inline-form" data-admin-form="profile"><input type="hidden" name="id" value="${escapeHtml(profile.id)}"><label class="sr-only" for="role-${escapeHtml(profile.id)}">Rol de ${escapeHtml(profile.nombre_completo || 'usuario')}</label><select id="role-${escapeHtml(profile.id)}" name="rol">${roles.map((role) => `<option value="${role}"${profile.rol === role ? ' selected' : ''}>${role}</option>`).join('')}</select><button class="quiet-button" type="submit">Guardar</button></form>`;
    return `<tr><td><strong>${escapeHtml(profile.nombre_completo || 'Sin nombre')}</strong><span class="table-subtle">${escapeHtml(profile.id)}</span></td><td>${roleControl}</td></tr>`;
  }).join('') || '<tr><td colspan="2" class="empty-state">Aún no hay usuarios registrados.</td></tr>';
  return `<section class="admin-view" id="usuarios-panel" aria-labelledby="usuarios-tab"><div class="admin-layout"><section class="admin-surface"><div class="section-heading"><div><p class="eyebrow">DIRECTORIO</p><h2>Usuarios</h2><p class="muted">Actualiza los roles de acceso de las cuentas existentes.</p></div><p class="record-count">${adminState.profiles.length} registrados</p></div><div class="table-wrap"><table><caption class="sr-only">Usuarios del aula y sus roles</caption><thead><tr><th scope="col">Usuario</th><th scope="col">Rol</th></tr></thead><tbody>${rows}</tbody></table></div></section><section class="admin-surface form-surface"><p class="eyebrow">NUEVA CUENTA</p><h2>Crear usuario</h2><p class="muted">La cuenta se crea de forma segura mediante el servicio de administración.</p><form data-admin-form="user"><label>Nombre completo<input name="nombre_completo" autocomplete="name" required></label><label>Correo electrónico<input name="email" type="email" autocomplete="email" required></label><label>Contraseña temporal<input name="password" type="password" autocomplete="new-password" minlength="8" required><span class="field-hint">Mínimo 8 caracteres.</span></label><label>Rol<select name="rol">${roles.map((role) => `<option value="${role}">${role}</option>`).join('')}</select></label><button class="primary" type="submit">Crear usuario</button></form></section></div></section>`;
}

function adminCoursesView() {
  const teachers = adminState.profiles.filter((profile) => profile.rol === 'docente');
  const teacherNames = new Map(teachers.map((teacher) => [teacher.id, teacher.nombre_completo || 'Sin nombre']));
  const teachingByCourse = new Map();
  adminState.teachings.forEach((teaching) => teachingByCourse.set(teaching.curso_id, [...(teachingByCourse.get(teaching.curso_id) || []), teacherNames.get(teaching.docente_id) || 'Docente sin nombre']));
  const levels = [['primaria', 'Primaria'], ['secundaria', 'Secundaria'], ['preuniversitaria', 'Preuniversitaria']];
  const officialCourses = adminState.courses.filter((course) => course.es_oficial);
  const customCourses = adminState.courses.filter((course) => !course.es_oficial);
  const visibleCourses = officialCourses.filter((course) => adminState.courseLevel === 'all' || course.nivel === adminState.courseLevel);
  const groups = levels.map(([level, label]) => {
    const courses = visibleCourses.filter((course) => course.nivel === level);
    if (!courses.length) return '';
    const rows = courses.map((course) => `<tr><td><strong>${escapeHtml(course.titulo)}</strong><span class="table-subtle">${escapeHtml(course.codigo)}</span></td><td>${escapeHtml((teachingByCourse.get(course.id) || []).join(', ') || 'Sin docente asignado')}</td></tr>`).join('');
    return `<section class="course-group" aria-labelledby="${level}-courses"><div class="course-group-heading"><h3 id="${level}-courses">${label}</h3><span>${courses.length} cursos</span></div><div class="table-wrap"><table><caption class="sr-only">Cursos oficiales de ${label} y docentes asignados</caption><thead><tr><th scope="col">Curso</th><th scope="col">Docentes</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }).join('') || '<p class="empty-state">No hay cursos oficiales para este nivel.</p>';
  const filters = [['all', 'Todos'], ...levels].map(([level, label]) => `<button type="button" class="course-filter${adminState.courseLevel === level ? ' is-selected' : ''}" data-course-level="${level}" aria-pressed="${adminState.courseLevel === level}">${label}</button>`).join('');
  const customRows = customCourses.map((course) => `<tr><td><strong>${escapeHtml(course.titulo)}</strong><span class="table-subtle">${escapeHtml(course.codigo)}</span></td><td>${escapeHtml(course.nivel)}</td><td>${escapeHtml(course.descripcion || 'Sin descripción')}</td></tr>`).join('') || '<tr><td colspan="3" class="empty-state">Aún no hay cursos personalizados.</td></tr>';
  return `<section class="admin-view" id="cursos-panel" aria-labelledby="cursos-tab"><div class="admin-layout"><div><section class="admin-surface"><div class="section-heading"><div><p class="eyebrow">CATÁLOGO OFICIAL</p><h2>Cursos</h2><p class="muted">Oferta académica oficial disponible para matrículas y asignaciones docentes.</p></div><p class="record-count">${officialCourses.length} cursos</p></div><div class="course-filters" role="group" aria-label="Filtrar cursos oficiales por nivel">${filters}</div><div class="course-groups">${groups}</div></section><section class="admin-surface custom-courses"><div class="section-heading"><div><p class="eyebrow">CURSOS PERSONALIZADOS</p><h2>Oferta creada por administración</h2></div><p class="record-count">${customCourses.length} cursos</p></div><div class="table-wrap"><table><caption class="sr-only">Cursos personalizados del aula</caption><thead><tr><th scope="col">Curso</th><th scope="col">Nivel</th><th scope="col">Descripción</th></tr></thead><tbody>${customRows}</tbody></table></div></section></div><section class="admin-surface form-surface"><p class="eyebrow">NUEVO CURSO</p><h2>Crear curso personalizado</h2><p class="muted">Se añade a las matrículas y asignaciones sin modificar el catálogo oficial.</p><form data-admin-form="course"><label>Código<input name="codigo" maxlength="40" required><span class="field-hint">Usa un código único, por ejemplo: MAT-REF-01.</span></label><label>Título<input name="titulo" maxlength="160" required></label><label>Nivel<select name="nivel" required>${levels.map(([level, label]) => `<option value="${level}">${label}</option>`).join('')}</select></label><label>Descripción <span class="optional">opcional</span><textarea name="descripcion" rows="4" maxlength="600"></textarea></label><button class="primary" type="submit">Crear curso</button></form></section></div></section>`;
}

function adminAssignmentsView() {
  const students = adminState.profiles.filter((profile) => profile.rol === 'estudiante');
  const teachers = adminState.profiles.filter((profile) => profile.rol === 'docente');
  const people = new Map(adminState.profiles.map((profile) => [profile.id, profile.nombre_completo || 'Sin nombre']));
  const courses = new Map(adminState.courses.map((course) => [course.id, `${course.codigo} · ${course.titulo}`]));
  const enrollmentRows = adminState.enrollments.map((enrollment) => `<tr><td>${escapeHtml(people.get(enrollment.estudiante_id) || 'Estudiante no disponible')}</td><td>${escapeHtml(courses.get(enrollment.curso_id) || 'Curso no disponible')}</td><td><span class="status-badge">${escapeHtml(enrollment.estado)}</span></td><td><button class="text-button danger" type="button" data-admin-action="remove-enrollment" data-student-id="${escapeHtml(enrollment.estudiante_id)}" data-course-id="${escapeHtml(enrollment.curso_id)}">Retirar</button></td></tr>`).join('') || '<tr><td colspan="4" class="empty-state">No hay matrículas registradas.</td></tr>';
  const teachingRows = adminState.teachings.map((teaching) => `<tr><td>${escapeHtml(people.get(teaching.docente_id) || 'Docente no disponible')}</td><td>${escapeHtml(courses.get(teaching.curso_id) || 'Curso no disponible')}</td><td><button class="text-button danger" type="button" data-admin-action="remove-teaching" data-teacher-id="${escapeHtml(teaching.docente_id)}" data-course-id="${escapeHtml(teaching.curso_id)}">Retirar</button></td></tr>`).join('') || '<tr><td colspan="3" class="empty-state">No hay docencias registradas.</td></tr>';
  const courseOptions = ['primaria', 'secundaria', 'preuniversitaria'].map((level) => {
    const coursesForLevel = adminState.courses.filter((course) => course.nivel === level);
    return coursesForLevel.length ? `<optgroup label="${escapeHtml(level[0].toUpperCase() + level.slice(1))}">${optionList(coursesForLevel, (course) => `${course.codigo} · ${course.titulo}`)}</optgroup>` : '';
  }).join('') || '<option value="">No hay cursos oficiales disponibles</option>';
  return `<section class="admin-view" id="asignaciones-panel" aria-labelledby="asignaciones-tab"><div class="assignment-forms"><section class="admin-surface form-surface"><p class="eyebrow">MATRÍCULA</p><h2>Asignar estudiante</h2><form data-admin-form="enrollment"><label>Estudiante<select name="estudiante_id" required ${students.length ? '' : 'disabled'}><option value="">Selecciona una persona</option>${optionList(students, (student) => student.nombre_completo || 'Sin nombre')}</select></label><label>Curso<select name="curso_id" required ${adminState.courses.length ? '' : 'disabled'}><option value="">Selecciona un curso</option>${courseOptions}</select></label><label>Estado<select name="estado"><option value="activa">Activa</option><option value="pausada">Pausada</option><option value="finalizada">Finalizada</option></select></label><button class="primary" type="submit" ${students.length && adminState.courses.length ? '' : 'disabled'}>Guardar matrícula</button></form></section><section class="admin-surface form-surface"><p class="eyebrow">DOCENCIA</p><h2>Asignar docente</h2><form data-admin-form="teaching"><label>Docente<select name="docente_id" required ${teachers.length ? '' : 'disabled'}><option value="">Selecciona una persona</option>${optionList(teachers, (teacher) => teacher.nombre_completo || 'Sin nombre')}</select></label><label>Curso<select name="curso_id" required ${adminState.courses.length ? '' : 'disabled'}><option value="">Selecciona un curso</option>${courseOptions}</select></label><button class="primary" type="submit" ${teachers.length && adminState.courses.length ? '' : 'disabled'}>Guardar docencia</button></form></section></div><div class="assignment-lists"><section class="admin-surface"><div class="section-heading"><div><p class="eyebrow">MATRÍCULAS ACTIVAS E HISTÓRICAS</p><h2>Estudiantes por curso</h2></div></div><div class="table-wrap"><table><caption class="sr-only">Matrículas del aula</caption><thead><tr><th>Estudiante</th><th>Curso</th><th>Estado</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>${enrollmentRows}</tbody></table></div></section><section class="admin-surface"><div class="section-heading"><div><p class="eyebrow">DOCENCIAS</p><h2>Docentes por curso</h2></div></div><div class="table-wrap"><table><caption class="sr-only">Docencias del aula</caption><thead><tr><th>Docente</th><th>Curso</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>${teachingRows}</tbody></table></div></section></div></section>`;
}

function renderAdmin(session, name) {
  const views = { usuarios: adminUsersView, cursos: adminCoursesView, asignaciones: adminAssignmentsView };
  const active = adminState.view;
  app.innerHTML = `<div class="shell admin-shell"><aside><div class="wordmark"><img src="../assets/logos/lumvea-header.png" alt="LUMVEA Educación" /></div><p class="nav-title">ADMINISTRACIÓN</p><nav class="admin-nav" aria-label="Administración del aula"><button id="usuarios-tab" type="button" data-admin-view="usuarios" aria-current="${active === 'usuarios' ? 'page' : 'false'}">Usuarios</button><button id="cursos-tab" type="button" data-admin-view="cursos" aria-current="${active === 'cursos' ? 'page' : 'false'}">Cursos</button><button id="asignaciones-tab" type="button" data-admin-view="asignaciones" aria-current="${active === 'asignaciones' ? 'page' : 'false'}">Asignaciones</button></nav><button class="signout" id="signout" type="button">Cerrar sesión</button></aside><main class="content" id="inicio"><header class="topbar"><div><p class="eyebrow">ADMINISTRACIÓN DEL AULA</p><h1>Hola, ${escapeHtml(name)}.</h1><p class="muted">Administra las cuentas, la oferta académica y sus asignaciones.</p></div><p class="user">Sesión de administración<br>${escapeHtml(session.user.email)}</p></header><p id="admin-status" class="admin-status" role="status" aria-live="polite"></p>${views[active]()}</main></div>`;
  bindAdminEvents(session, name);
}

async function refreshAdmin(session, name, message = '') {
  try {
    await loadAdminData();
    renderAdmin(session, name);
    if (message) adminStatus(message);
  } catch (error) {
    renderAdmin(session, name);
    adminStatus('No pudimos cargar los datos de administración. Inténtalo nuevamente.', 'error');
    console.error(error);
  }
}

function bindAdminEvents(session, name) {
  document.querySelector('#signout').addEventListener('click', () => supabase.auth.signOut());
  app.onclick = async (event) => {
    const viewButton = event.target.closest('[data-admin-view]');
    if (viewButton) {
      adminState.view = viewButton.dataset.adminView;
      renderAdmin(session, name);
      return;
    }
    const courseLevel = event.target.closest('[data-course-level]');
    if (courseLevel) {
      adminState.courseLevel = courseLevel.dataset.courseLevel;
      renderAdmin(session, name);
      return;
    }
    const action = event.target.closest('[data-admin-action]');
    if (!action) return;
    action.disabled = true;
    const { error } = action.dataset.adminAction === 'remove-enrollment'
      ? await supabase.from('matriculas_aula').delete().eq('estudiante_id', action.dataset.studentId).eq('curso_id', action.dataset.courseId)
      : await supabase.from('docencias_aula').delete().eq('docente_id', action.dataset.teacherId).eq('curso_id', action.dataset.courseId);
    if (error) {
      action.disabled = false;
      adminStatus(error.message || 'No se pudo retirar la asignación.', 'error');
      return;
    }
    await refreshAdmin(session, name, 'Asignación retirada.');
  };
  app.onsubmit = async (event) => {
    const form = event.target.closest('[data-admin-form]');
    if (!form) return;
    event.preventDefault();
    setSubmitting(form, true);
    const values = Object.fromEntries(new FormData(form));
    let error;
    let message;
    if (form.dataset.adminForm === 'user') ({ error } = await supabase.functions.invoke('admin-aula', { body: values }), message = 'Usuario creado correctamente.');
    if (form.dataset.adminForm === 'profile') ({ error } = await supabase.from('perfiles').update({ rol: values.rol }).eq('id', values.id), message = 'Rol actualizado.');
    if (form.dataset.adminForm === 'course') ({ error } = await supabase.from('cursos_aula').insert({ ...values, descripcion: values.descripcion || null, es_oficial: false }), message = 'Curso personalizado creado.');
    if (form.dataset.adminForm === 'enrollment') ({ error } = await supabase.from('matriculas_aula').upsert(values, { onConflict: 'estudiante_id,curso_id' }), message = 'Matrícula guardada.');
    if (form.dataset.adminForm === 'teaching') ({ error } = await supabase.from('docencias_aula').upsert(values, { onConflict: 'docente_id,curso_id' }), message = 'Docencia guardada.');
    if (error) {
      setSubmitting(form, false);
      adminStatus(error.message || 'No se pudo guardar el cambio.', 'error');
      return;
    }
    await refreshAdmin(session, name, message);
  };
}

async function adminDashboard(session, profile) {
  const name = profile?.nombre_completo || session.user.email;
  adminState.currentUserId = session.user.id;
  await refreshAdmin(session, name);
  protectSession();
}

async function dashboard(session) {
  document.querySelector('.aula-public-header')?.remove();
  const userId = session.user.id;
  const [{ data: profile }, { data: enrollments }, { data: sessions }, { data: materials }] = await Promise.all([
    supabase.from('perfiles').select('nombre_completo, rol').eq('id', userId).single(),
    supabase.from('matriculas_aula').select('estado, cursos_aula(titulo, codigo, nivel, docente)').eq('estudiante_id', userId).eq('estado', 'activa'),
    supabase.from('sesiones_aula').select('titulo, inicia_en, enlace_clase, cursos_aula(titulo, codigo)').gte('inicia_en', new Date().toISOString()).order('inicia_en').limit(1),
    supabase.from('materiales_aula').select('titulo, tipo, enlace, cursos_aula(titulo)').order('publicado_en', { ascending: false }).limit(6),
  ]);
  if ((profile?.rol || 'estudiante') === 'administrador') return adminDashboard(session, profile);
  const name = profile?.nombre_completo || session.user.email;
  const role = profile?.rol || 'estudiante';
  const roleLabel = role === 'docente' ? 'DOCENCIA' : 'ESTUDIANTE';
  const next = sessions?.[0];
  const date = next ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(next.inicia_en)) : 'Aún no tienes clases programadas.';
  app.innerHTML = `<div class="shell"><aside><div class="wordmark">LUMVEA AULA</div><p class="nav-title">ESPACIO DE ${roleLabel}</p><a class="nav-item" href="#inicio">Mi inicio</a><button class="signout" id="signout" type="button">Cerrar sesión</button></aside><main class="content" id="inicio"><header class="topbar"><div><p class="eyebrow">MI APRENDIZAJE</p><h1>Hola, ${escapeHtml(name)}.</h1><p class="muted">Aquí encontrarás tus clases y materiales asignados.</p></div><p class="user">Sesión de ${roleLabel.toLowerCase()}<br>${escapeHtml(session.user.email)}</p></header><section class="grid"><article class="card next"><p class="label">PRÓXIMA CLASE</p><div class="session"><div><h2>${escapeHtml(next?.titulo || 'Sin clases próximas')}</h2><p class="muted">${escapeHtml(next?.cursos_aula?.titulo || '')}<br>${date}</p></div>${next?.enlace_clase ? `<a class="action" href="${escapeHtml(next.enlace_clase)}" target="_blank" rel="noopener">Ingresar a clase</a>` : ''}</div></article><article class="card courses"><p class="label">MIS CURSOS</p><ul>${enrollments?.length ? enrollments.map(({ cursos_aula: course }) => `<li><strong>${escapeHtml(course.titulo)}</strong><br><span class="muted">${escapeHtml(course.codigo)} · ${escapeHtml(course.docente || 'Docente por asignar')}</span></li>`).join('') : '<li class="muted">Aún no tienes cursos asignados.</li>'}</ul></article><article class="card materials"><p class="label">MATERIALES RECIENTES</p><ul>${materials?.length ? materials.map((material) => `<li><span class="tag">${escapeHtml(material.tipo)}</span><br><a href="${escapeHtml(material.enlace)}" target="_blank" rel="noopener">${escapeHtml(material.titulo)}</a><span class="muted"> · ${escapeHtml(material.cursos_aula?.titulo || '')}</span></li>`).join('') : '<li class="muted">Los materiales aparecerán aquí cuando estén disponibles.</li>'}</ul></article></section></main></div>`;
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
  protectSession();
}

async function render() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) dashboard(session);
  else login();
}

supabase.auth.onAuthStateChange((_event, session) => { if (session) dashboard(session); else login(); });
render();
