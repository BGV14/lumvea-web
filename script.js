const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.site-nav');
const form = document.querySelector('#interest-form');
const message = document.querySelector('#form-message');
const turnButtons = document.querySelectorAll('.turn-button');
const turnSummary = document.querySelector('#turn-summary');
const blockTimes = document.querySelector('.block-times');
const packageFilters = document.querySelectorAll('.package-filter');
const packageCards = document.querySelectorAll('.package-card');
if (navigation) {
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  const selectedLevel = new URLSearchParams(location.search).get('nivel');
  const links = [
    { href: 'index.html', label: 'Inicio' },
    { href: 'nivel.html?nivel=primaria&vista=inicio', label: 'Primaria', items: [['nivel.html?nivel=primaria&vista=inicio', 'Ver nivel'], ['nivel.html?nivel=primaria&vista=cursos', 'Cursos'], ['nivel.html?nivel=primaria&vista=horario', 'Horario'], ['nivel.html?nivel=primaria&vista=paquetes', 'Paquetes']] },
    { href: 'nivel.html?nivel=secundaria&vista=inicio', label: 'Secundaria', items: [['nivel.html?nivel=secundaria&vista=inicio', 'Ver nivel'], ['nivel.html?nivel=secundaria&vista=cursos', 'Cursos'], ['nivel.html?nivel=secundaria&vista=horario', 'Horario'], ['nivel.html?nivel=secundaria&vista=paquetes', 'Paquetes']] },
    { href: 'nivel.html?nivel=preuniversitaria&vista=inicio', label: 'Preuniversitaria', items: [['nivel.html?nivel=preuniversitaria&vista=inicio', 'Ver nivel'], ['nivel.html?nivel=preuniversitaria&vista=cursos', 'Cursos y turnos'], ['nivel.html?nivel=preuniversitaria&vista=horario', 'Bloques horarios'], ['nivel.html?nivel=preuniversitaria&vista=paquetes', 'Paquetes']] },
    { href: 'metodo.html', label: 'Método' },
    { href: 'aula/', label: 'Aula virtual' },
    { href: 'inscripcion.html?origen=directo', label: 'Inscripción' },
  ];
  navigation.innerHTML = links.map(({ href, label, items }) => {
    const active = (href === currentPage || (selectedLevel && href.includes(`nivel=${selectedLevel}`))) ? ' class="nav-active" aria-current="page"' : '';
    if (!items) return `<a href="${href}"${active}>${label}</a>`;
    return `<div class="nav-dropdown"><button class="nav-dropdown-trigger${active ? ' nav-active' : ''}" type="button" aria-expanded="false">${label}</button><button class="nav-dropdown-arrow" type="button" aria-expanded="false" aria-label="Ver secciones de ${label}">⌄</button><div class="nav-dropdown-panel">${items.map(([itemHref, itemLabel]) => `<a href="${itemHref}">${itemLabel}</a>`).join('')}</div></div>`;
  }).join('');
}
const timeBlocks = {
  morning: ['08:00 - 09:30', '09:50 - 11:20', '11:40 - 13:10', '13:30 - 15:00'],
  evening: ['15:00 - 16:30', '16:50 - 18:20', '18:40 - 20:10', '20:30 - 22:00'],
};
const whatsappNumber = '51907283417';
const whatsappLink = (message) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
const supabaseUrl = 'https://htojlbttqcggbqussdny.supabase.co';
const supabasePublishableKey = 'sb_publishable_1OlMJBnTzARk-Rbn9U-Ayg_kMp4laPv';
const turnstileSiteKey = '0x4AAAAAAEq47cBjcOQWdlyp';

async function saveRequest(request) {
  const response = await fetch(`${supabaseUrl}/functions/v1/submit-solicitud`, {
    method: 'POST',
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${supabasePublishableKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'No se pudo guardar la solicitud.');
  return result;
}

document.querySelectorAll('.brand').forEach((brand) => {
  brand.classList.add('brand-logo');
  brand.innerHTML = '<img src="assets/logos/lumvea-header.png" alt="LUMVEA: Primaria, Secundaria y Preuniversitaria" />';
});

function toggleDropdown(dropdown) {
  document.querySelectorAll('.nav-dropdown').forEach((item) => {
    if (item !== dropdown) {
      item.classList.remove('is-open');
      item.querySelectorAll('button').forEach((button) => button.setAttribute('aria-expanded', 'false'));
    }
  });
  const open = dropdown.classList.toggle('is-open');
  dropdown.querySelectorAll('button').forEach((button) => button.setAttribute('aria-expanded', String(open)));
}

document.querySelectorAll('.nav-dropdown button').forEach((button) => {
  button.addEventListener('click', () => {
    const dropdown = button.closest('.nav-dropdown');
    toggleDropdown(dropdown);
  });
});

document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
  dropdown.addEventListener('mouseleave', () => {
    if (window.matchMedia('(max-width: 820px)').matches) return;
    dropdown.classList.remove('is-open');
    dropdown.querySelectorAll('button').forEach((button) => button.setAttribute('aria-expanded', 'false'));
    if (dropdown.contains(document.activeElement)) document.activeElement.blur();
  });
});


const currentPage = location.pathname.split('/').pop() || 'index.html';
const levelSchedules = {
  'primaria.html': {
    label: 'HORARIO PRIMARIA',
    title: 'Bloques para aprender con equilibrio.',
    subjects: ['Aritmética y lenguaje', 'Geometría y razonamiento matemático', 'Ciencia y tecnología', 'Comprensión lectora e inglés'],
  },
  'secundaria.html': {
    label: 'HORARIO SECUNDARIA',
    title: 'Bloques que fortalecen cada área.',
    subjects: ['Trigonometría, lenguaje y álgebra', 'Geometría, razonamiento matemático y verbal', 'Física, biología y aritmética', 'Química, literatura e inglés'],
  },
};

if (currentPage === 'nivel.html') {
  const params = new URLSearchParams(location.search);
  const levelKey = params.get('nivel') || 'primaria';
  const view = params.get('vista') || 'inicio';
  const selectedCourse = params.get('curso');
  const selectedCourses = (params.get('cursos') || '').split('|').filter(Boolean);
  const selectedPackage = params.get('paquete');
  const selectedTurn = params.get('turno');
  const selectedPrice = params.get('precio');
  const selectedCadence = params.get('modalidad');
  const selectedOrigin = params.get('origen');
  const packageCatalog = {
    primaria: [
      ['Paquete Matemático', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Geometría'], 18, 15, 60, 45],
      ['Paquete Comunicación', ['Lenguaje', 'Comprensión Lectora', 'Razonamiento Verbal'], 12, 9, 36, 27],
      ['Paquete Ciencias Naturales + Ciencias Sociales', ['Ciencia y Tecnología', 'Personal Social'], 6, 3, 12, 9],
      ['Paquete Inglés', ['Inglés'], 6, 3, 12, 9],
      ['Paquete Matemático + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Geometría', 'Inglés'], 24, 21, 84, 63],
      ['Paquete Comunicación + Inglés', ['Lenguaje', 'Comprensión Lectora', 'Razonamiento Verbal', 'Inglés'], 18, 15, 60, 45],
      ['Paquete Ciencias Naturales + Ciencias Sociales + Inglés', ['Ciencia y Tecnología', 'Personal Social', 'Inglés'], 12, 9, 36, 27],
      ['Paquete Matemático + Comunicación + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Geometría', 'Lenguaje', 'Comprensión Lectora', 'Razonamiento Verbal', 'Inglés'], 36, 33, 132, 99],
      ['Paquete Matemático + Ciencias Naturales + Ciencias Sociales + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Geometría', 'Ciencia y Tecnología', 'Personal Social', 'Inglés'], 36, 33, 132, 99],
      ['Paquete Comunicación + Ciencias Naturales + Ciencias Sociales + Inglés', ['Lenguaje', 'Comprensión Lectora', 'Razonamiento Verbal', 'Ciencia y Tecnología', 'Personal Social', 'Inglés'], 24, 21, 84, 63],
      ['Paquete Completo', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Geometría', 'Lenguaje', 'Comprensión Lectora', 'Razonamiento Verbal', 'Ciencia y Tecnología', 'Personal Social', 'Inglés'], 42, 39, 156, 117],
    ],
    secundaria: [
      ['Paquete Matemático', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría'], 24, 21, 84, 63],
      ['Paquete Comunicación', ['Lenguaje', 'Literatura', 'Razonamiento Verbal'], 9, 6, 24, 18],
      ['Paquete Ciencias Naturales', ['Física', 'Química', 'Biología'], 18, 15, 60, 45],
      ['Paquete Inglés', ['Inglés'], null, null, 12, 9],
      ['Paquete Matemático + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Inglés'], 27, 24, 96, 72],
      ['Paquete Comunicación + Inglés', ['Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Inglés'], 12, 9, 36, 27],
      ['Paquete Ciencias Naturales + Inglés', ['Física', 'Química', 'Biología', 'Inglés'], 21, 18, 72, 54],
      ['Paquete Matemático + Comunicación + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Inglés'], 36, 33, 132, 99],
      ['Paquete Matemático + Ciencias Naturales + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Física', 'Química', 'Biología', 'Inglés'], 45, 42, 168, 126],
      ['Paquete Ciencias Naturales + Comunicación + Inglés', ['Física', 'Química', 'Biología', 'Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Inglés'], 30, 27, 108, 81],
      ['Paquete Completo', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Física', 'Química', 'Biología', 'Inglés'], 54, 51, 204, 153],
    ],
    preuniversitaria: [
      ['Paquete Matemático', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría'], 28, 24, 96, 72],
      ['Paquete Comunicación', ['Lenguaje', 'Literatura', 'Razonamiento Verbal'], 12, 8, 32, 24],
      ['Paquete Ciencias Sociales', ['Psicología', 'Educación Cívica', 'Historia del Perú', 'Historia Universal', 'Geografía', 'Economía', 'Filosofía'], 28, 24, 96, 72],
      ['Paquete Ciencias Naturales', ['Física', 'Química', 'Biología'], 24, 20, 80, 60],
      ['Paquete Inglés', ['Inglés'], null, null, 16, 12],
      ['Paquete Matemático + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Inglés'], 32, 28, 112, 84],
      ['Paquete Comunicación + Inglés', ['Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Inglés'], 16, 12, 48, 36],
      ['Paquete Ciencias Sociales + Inglés', ['Psicología', 'Educación Cívica', 'Historia del Perú', 'Historia Universal', 'Geografía', 'Economía', 'Filosofía', 'Inglés'], 32, 28, 112, 84],
      ['Paquete Ciencias Naturales + Inglés', ['Física', 'Química', 'Biología', 'Inglés'], 28, 24, 96, 72],
      ['Paquete Matemático + Comunicación + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Inglés'], 44, 40, 160, 120],
      ['Paquete Matemático + Ciencias Naturales + Inglés', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Física', 'Química', 'Biología', 'Inglés'], 56, 52, 208, 156],
      ['Paquete Ciencias Naturales + Comunicación + Inglés', ['Física', 'Química', 'Biología', 'Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Inglés'], 40, 36, 144, 108],
      ['Paquete Completo', ['Razonamiento Matemático', 'Aritmética', 'Álgebra', 'Trigonometría', 'Geometría', 'Lenguaje', 'Literatura', 'Razonamiento Verbal', 'Psicología', 'Educación Cívica', 'Historia del Perú', 'Historia Universal', 'Geografía', 'Economía', 'Filosofía', 'Física', 'Química', 'Biología', 'Inglés'], 96, 92, 368, 276],
    ],
  };
  const levels = {
    primaria: {
      name: 'Primaria',
      lead: 'Bases firmes, curiosidad y acompañamiento para aprender con confianza.',
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      courses: [['Razonamiento Matemático', 'Matemáticas', 1], ['Aritmética', 'Matemáticas', 2], ['Álgebra', 'Matemáticas', 1], ['Geometría', 'Matemáticas', 2], ['Lenguaje', 'Comunicación', 2], ['Comprensión Lectora', 'Comunicación', 2], ['Razonamiento Verbal', 'Comunicación', 1], ['Personal Social', 'Ciencias Sociales', 1], ['Ciencia y Tecnología', 'Ciencias Naturales', 1], ['Inglés', 'Inglés', 2]],
      scheduleRows: [['Aritmética', 'Lenguaje', 'Personal social', 'Inglés', 'Álgebra', 'Simulacro'], ['Geometría', 'Razonamiento matemático', 'Comprensión lectora', 'Comprensión lectora', 'Inglés', ''], ['Ciencia y tecnología', 'Razonamiento verbal', 'Aritmética', 'Geometría', 'Lenguaje', '']],
      packages: packageCatalog.primaria,
    },
    secundaria: {
      name: 'Secundaria',
      lead: 'Refuerzo por áreas para avanzar con método hacia nuevos retos académicos.',
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      courses: [['Razonamiento Matemático', 'Matemáticas', 2], ['Aritmética', 'Matemáticas', 2], ['Álgebra', 'Matemáticas', 1], ['Trigonometría', 'Matemáticas', 1], ['Geometría', 'Matemáticas', 2], ['Lenguaje', 'Comunicación', 1], ['Literatura', 'Comunicación', 1], ['Razonamiento Verbal', 'Comunicación', 1], ['Física', 'Ciencias Naturales', 2], ['Química', 'Ciencias Naturales', 2], ['Biología', 'Ciencias Naturales', 2], ['Inglés', 'Inglés', 1]],
      scheduleRows: [['Trigonometría', 'Lenguaje', 'Álgebra', 'Física', 'Inglés', 'Razonamiento matemático', 'Simulacro'], ['Geometría', 'Razonamiento matemático', 'Razonamiento verbal', 'Química', 'Literatura', 'Química', ''], ['Física', 'Biología', 'Aritmética', 'Geometría', 'Aritmética', 'Biología', '']],
      packages: packageCatalog.secundaria,
    },
    preuniversitaria: {
      name: 'Preuniversitaria',
      lead: 'Cursos, turnos y práctica para organizar una ruta de preparación universitaria.',
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      courses: [['Razonamiento Matemático', 'Matemáticas', 1], ['Aritmética', 'Matemáticas', 2], ['Álgebra', 'Matemáticas', 1], ['Trigonometría', 'Matemáticas', 1], ['Geometría', 'Matemáticas', 2], ['Lenguaje', 'Comunicación', 1], ['Literatura', 'Comunicación', 1], ['Razonamiento Verbal', 'Comunicación', 1], ['Psicología', 'Ciencias Sociales', 1], ['Educación Cívica', 'Ciencias Sociales', 1], ['Historia del Perú', 'Ciencias Sociales', 1], ['Historia Universal', 'Ciencias Sociales', 1], ['Geografía', 'Ciencias Sociales', 1], ['Economía', 'Ciencias Sociales', 1], ['Filosofía', 'Ciencias Sociales', 1], ['Física', 'Ciencias Naturales', 2], ['Química', 'Ciencias Naturales', 2], ['Biología', 'Ciencias Naturales', 2], ['Inglés', 'Inglés', 1]],
      scheduleRows: [['Trigonometría', 'Lenguaje', 'Historia universal', 'Economía', 'Álgebra', 'Aritmética', 'Simulacro'], ['Historia del Perú', 'Razonamiento matemático', 'Razonamiento verbal', 'Química', 'Literatura', 'Física', ''], ['Física', 'Biología', 'Cívica', 'Geometría', 'Filosofía', 'Biología', ''], ['Psicología', 'Química', 'Geografía', 'Aritmética', 'Inglés', 'Geometría', '']],
      packages: packageCatalog.preuniversitaria,
    },
  };
  const level = levels[levelKey] || levels.primaria;
  const officialPackages = level.packages;
  level.packages = officialPackages.map(([title, coursesInPackage, weeklyRegular, weeklyOffer, monthlyRegular, monthlyOffer]) => [title, weeklyOffer === null ? 'No disponible' : `S/ ${weeklyOffer}`, `S/ ${monthlyOffer}`]);
  const app = document.querySelector('#level-interface');
  const base = `nivel.html?nivel=${levelKey}`;
  const contextParams = new URLSearchParams();
  if (selectedCourse) contextParams.set('curso', selectedCourse);
  if (selectedCourses.length) contextParams.set('cursos', selectedCourses.join('|'));
  if (selectedPackage) contextParams.set('paquete', selectedPackage);
  if (selectedTurn) contextParams.set('turno', selectedTurn);
  if (selectedPrice) contextParams.set('precio', selectedPrice);
  if (selectedCadence) contextParams.set('modalidad', selectedCadence);
  if (selectedOrigin) contextParams.set('origen', selectedOrigin);
  const levelUrl = (targetView) => `${base}&vista=${targetView}${contextParams.size ? `&${contextParams}` : ''}`;
  const levelTitle = { primaria: 'Refuerzo escolar para primaria.', secundaria: 'Acompañamiento para secundaria.', preuniversitaria: 'Preparación preuniversitaria.' }[levelKey];
  const courseDescriptions = {
    'Razonamiento Matemático': 'Entrena tu lógica y aprende a resolver problemas con seguridad.',
    'Aritmética': 'Gana agilidad con números y aplica estrategias para resolver ejercicios.',
    'Álgebra': 'Comprende las relaciones entre números y avanza paso a paso en cada problema.',
    'Geometría': 'Visualiza, interpreta y resuelve desafíos con figuras y medidas.',
    'Trigonometría': 'Domina razones, ángulos y ejercicios clave para seguir avanzando.',
    'Lenguaje': 'Expresa tus ideas con claridad y mejora tu comprensión del idioma.',
    'Literatura': 'Descubre obras, autores y recursos para comprender mejor cada texto.',
    'Comprensión Lectora': 'Lee con propósito, identifica ideas clave y responde con confianza.',
    'Razonamiento Verbal': 'Amplía tu vocabulario y fortalece tu capacidad de análisis.',
    'Personal Social': 'Conecta lo que aprendes con tu entorno, comunidad e historia.',
    'Ciencia y Tecnología': 'Explora cómo funciona el mundo a través de preguntas y experimentos.',
    'Física': 'Comprende movimiento, fuerzas y fenómenos que ves todos los días.',
    'Química': 'Descubre la materia y aprende a interpretar sus cambios.',
    'Biología': 'Conoce los seres vivos y los procesos que hacen posible la vida.',
    'Psicología': 'Comprende cómo pensamos, sentimos y tomamos decisiones.',
    'Educación Cívica': 'Fortalece tu criterio para participar responsablemente en sociedad.',
    'Historia del Perú': 'Entiende nuestro pasado para interpretar mejor el presente.',
    'Historia Universal': 'Relaciona grandes procesos históricos con el mundo actual.',
    'Geografía': 'Lee el territorio, sus recursos y la relación entre sociedad y ambiente.',
    'Economía': 'Aprende a tomar decisiones y entender cómo se organizan los recursos.',
    'Filosofía': 'Formula mejores preguntas y desarrolla pensamiento crítico.',
    'Inglés': 'Comunícate con mayor confianza y abre nuevas oportunidades de aprendizaje.',
  };
  const subnav = `<nav class="level-subnav" aria-label="Secciones de ${level.name}"><a class="${view === 'inicio' ? 'is-current' : ''}" href="${levelUrl('inicio')}">Resumen</a><a class="${view === 'cursos' ? 'is-current' : ''}" href="${levelUrl('cursos')}">Cursos</a><a class="${view === 'horario' ? 'is-current' : ''}" href="${levelUrl('horario')}">Horario</a><a class="${view === 'paquetes' ? 'is-current' : ''}" href="${levelUrl('paquetes')}">Paquetes</a></nav>`;
  const intro = `<section class="page-intro section"><p class="eyebrow">LUMVEA ${level.name.toUpperCase()}</p><h1>${levelTitle}</h1><p>${level.lead} Revisa los cursos, el horario o los paquetes según lo que necesites.</p></section>${subnav}`;
  const courses = `<section class="level-content section"><p class="eyebrow">CURSOS</p><h2>Elige la materia que quieres fortalecer.</h2><p class="content-lead">Cada curso está diseñado para ayudarte a avanzar con práctica guiada, explicaciones claras y objetivos alcanzables.</p><div class="course-grid">${level.courses.map(([title, area]) => `<article><p class="course-area">${area}</p><h3>${title}</h3><p class="course-copy">${courseDescriptions[title]}</p><a href="${base}&vista=paquetes">Ver opciones relacionadas →</a></article>`).join('')}</div></section>`;
  const recessDays = levelKey === 'primaria' ? 5 : 6;
  const scheduleRows = level.scheduleRows.flatMap((row, index) => {
    if (index === level.scheduleRows.length - 1) return [{ cells: row, isBreak: false }];
    const breakRow = Array(level.days.length).fill('');
    breakRow.fill('Receso', 0, recessDays);
    return [{ cells: row, isBreak: false }, { cells: breakRow, isBreak: true }];
  });
  const turnHours = levelKey === 'preuniversitaria'
    ? { morning: '08:00 - 15:00', evening: '15:00 - 22:00' }
    : { morning: '08:00 - 13:10', evening: '15:00 - 20:10' };
  const schedule = `<section class="level-content section"><p class="eyebrow">HORARIO</p><h2>Planifica tu semana de clases.</h2><p class="content-lead">Elige el turno que mejor se adapte a tu rutina. Cada bloque dura 90 minutos y muestra la materia que tendrás cada día.</p><div class="shift-switch" aria-label="Elegir turno"><button class="shift-button is-selected" data-shift="morning" type="button">Turno mañana <small>${turnHours.morning}</small></button><button class="shift-button" data-shift="evening" type="button">Turno tarde / noche <small>${turnHours.evening}</small></button></div><p class="schedule-hint">Desliza la tabla horizontalmente si la visualizas desde un celular.</p><div class="schedule-table-wrap level-table"><table><caption class="sr-only">Horario semanal de ${level.name}</caption><thead><tr><th>Horario</th>${level.days.map((day) => `<th>${day}</th>`).join('')}</tr></thead><tbody>${scheduleRows.map((row, index) => `<tr><th scope="row" data-time="${index}"></th>${row.isBreak ? `<td colspan="${recessDays}">Receso</td><td>${row.cells[recessDays] || '-'}</td>` : row.cells.map((cell) => `<td>${cell || '-'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
  const subjectGroups = levelKey === 'primaria'
    ? { math: 'Razonamiento Matemático, Aritmética, Álgebra y Geometría', communication: 'Lenguaje, Comprensión Lectora y Razonamiento Verbal', science: 'Ciencia y Tecnología y Personal Social', english: 'Inglés' }
    : levelKey === 'secundaria'
      ? { math: 'Razonamiento Matemático, Aritmética, Álgebra, Trigonometría y Geometría', communication: 'Lenguaje, Literatura y Razonamiento Verbal', science: 'Física, Química y Biología', english: 'Inglés' }
      : { math: 'Razonamiento Matemático, Aritmética, Álgebra, Trigonometría y Geometría', communication: 'Lenguaje, Literatura y Razonamiento Verbal', science: 'Física, Química y Biología', social: 'Psicología, Educación Cívica, Historia del Perú, Historia Universal, Geografía, Economía y Filosofía', english: 'Inglés' };
  const scheduleAreaFor = (subject) => {
    const normalizedSubject = subject.toLowerCase();
    if (['razonamiento matemático', 'aritmética', 'álgebra', 'geometría', 'trigonometría'].includes(normalizedSubject)) return 'math';
    if (['lenguaje', 'comprensión lectora', 'razonamiento verbal', 'literatura'].includes(normalizedSubject)) return 'communication';
    if (['personal social', 'ciencia y tecnología', 'física', 'química', 'biología'].includes(normalizedSubject)) return 'science';
    if (['psicología', 'cívica', 'educación cívica', 'historia del perú', 'historia universal', 'geografía', 'economía', 'filosofía'].includes(normalizedSubject)) return 'social';
    if (normalizedSubject === 'inglés') return 'english';
    return '';
  };
  const packageAreasFor = (packageName) => {
    if (!level.packages.some(([title]) => title === packageName)) return [];
    if (packageName === 'Paquete Completo') return Object.keys(subjectGroups);
    const normalizedPackage = packageName.toLowerCase();
    const areas = [];
    if (normalizedPackage.includes('matemática')) areas.push('math');
    if (normalizedPackage.includes('comunicación')) areas.push('communication');
    if (normalizedPackage.includes('naturales') || (normalizedPackage.includes('ciencias') && !normalizedPackage.includes('sociales'))) areas.push('science');
    if (levelKey === 'preuniversitaria' && normalizedPackage.includes('sociales')) areas.push('social');
    if (normalizedPackage.includes('inglés')) areas.push('english');
    return areas;
  };
  const normalizeCourse = (course) => ({ 'cívica': 'educación cívica' }[course.toLowerCase()] || course.toLowerCase());
  const courseNamesForPackage = (packageName) => officialPackages.find(([title]) => title === packageName)?.[1] || [];
  const subjectsFor = (title) => {
    if (title === 'Paquete Completo') return Object.values(subjectGroups).join(' · ');
    const normalizedTitle = title.toLowerCase();
    const subjects = [];
    if (normalizedTitle.includes('matemática')) subjects.push(subjectGroups.math);
    if (normalizedTitle.includes('comunicación')) subjects.push(subjectGroups.communication);
    if ((normalizedTitle.includes('ciencias') && !normalizedTitle.includes('sociales')) || normalizedTitle.includes('naturales')) subjects.push(subjectGroups.science);
    if (normalizedTitle.includes('sociales')) subjects.push(subjectGroups.social || subjectGroups.science);
    if (normalizedTitle.includes('inglés')) subjects.push(subjectGroups.english);
    return subjects.join(' · ');
  };
  const packages = `<section class="level-content section"><p class="eyebrow">PAQUETES</p><h2>Opciones semanales y mensuales.</h2><p class="content-lead">La mensualidad equivale a cuatro semanas del mismo programa.</p><div class="package-controls level-package-controls" role="group" aria-label="Filtrar paquetes"><button class="level-package-filter is-selected" type="button" data-filter="all" aria-pressed="true">Todos</button><button class="level-package-filter" type="button" data-filter="area" aria-pressed="false">Por área</button><button class="level-package-filter" type="button" data-filter="combo" aria-pressed="false">Combinados</button><button class="level-package-filter" type="button" data-filter="complete" aria-pressed="false">Completo</button></div><div class="package-grid">${level.packages.map(([title, weekly, monthly]) => { const type = title === 'Paquete completo' ? 'complete' : title.includes('+') ? 'combo' : 'area'; const weeklyOffer = Number(weekly.replace('S/ ', '')); const monthlyOffer = Number(monthly.replace('S/ ', '')); const weeklyRegular = weeklyOffer + (levelKey === 'preuniversitaria' ? 4 : 3); const monthlyRegular = levelKey === 'preuniversitaria' ? ({ 70: 96, 24: 32, 60: 80, 84: 112, 36: 48, 120: 160, 156: 208, 108: 144, 276: 368 }[monthlyOffer]) : Math.round(monthlyOffer * 4 / 3); return `<article class="package-card level-package-card" data-type="${type}"><p class="package-label">${type === 'complete' ? 'PREPARACIÓN INTEGRAL' : type === 'combo' ? 'COMBINADO' : 'POR ÁREA'} · ${level.name.toUpperCase()}</p><h3>${title}</h3><p class="package-subjects"><b>Cursos:</b> ${subjectsFor(title)}</p><p class="price-row"><span>Semana</span><del>S/ ${weeklyRegular}</del><strong>${weekly}</strong><em>Oferta</em></p><p class="price-row"><span>Mes: 4 sem.</span><del>S/ ${monthlyRegular}</del><strong>${monthly}</strong><em>Oferta</em></p><button class="choose-package" type="button" data-package="${title}">Elegir paquete</button></article>`; }).join('')}</div><p class="package-selection" aria-live="polite"></p></section>`;
  const blockPrice = levelKey === 'preuniversitaria' ? 4 : 3;
  function packageOfferFor(packageName) {
    const [, coursesInPackage, weeklyRegular, weeklyOffer, monthlyRegular, monthlyOffer] = officialPackages.find(([title]) => title === packageName) || [];
    return { courses: coursesInPackage || [], weeklyRegular, weeklyOffer, monthlyRegular, monthlyOffer };
  }
  const predefinedPackageForCourses = (coursesToMatch) => {
    const normalizedCourses = [...coursesToMatch].sort().join('|');
    return level.packages.find(([packageName]) => courseNamesForPackage(packageName).sort().join('|') === normalizedCourses)?.[0] || '';
  };
  const promotionBuilder = `<section class="custom-promotion section"><p class="eyebrow">ARMA TU PROMOCIÓN</p><h2>Combina cursos y crea tu propio paquete.</h2><p class="content-lead">Un curso tiene promoción mensual. Al combinar cursos, podrás elegir una promoción semanal o mensual; desde tres bloques se descuenta un bloque por semana.</p><div class="promo-rules"><span><b>1 curso</b> · Solo promoción mensual</span><span><b>2 o más cursos</b> · Elige semanal o mensual</span></div><div class="promo-course-grid">${level.courses.map(([title, area, blocks]) => `<label class="promo-course-option"><input type="checkbox" data-promo-course data-blocks="${blocks}" value="${title}"${selectedCourse === title ? ' checked' : ''} /><span><b>${title}</b><small>${area} · ${blocks} ${blocks === 1 ? 'bloque' : 'bloques'}</small></span></label>`).join('')}</div><div class="promo-summary" aria-live="polite">Selecciona cursos para calcular tu promoción.</div><div class="promo-frequency" hidden><p>Elige la modalidad que prefieras:</p><div><button type="button" data-promo-frequency="weekly"></button><button type="button" data-promo-frequency="monthly"></button></div></div><button class="button button-primary custom-promo-continue" type="button" disabled>Continuar con esta promoción</button></section>`;
  const summary = `<section class="level-content section level-start"><p class="eyebrow">EMPIEZA AQUÍ</p><h2>¿Qué quieres revisar?</h2><p class="content-lead">Selecciona una opción para conocer las materias, ver el horario semanal o comparar los paquetes disponibles.</p><div class="overview-links"><a href="${levelUrl('cursos')}">Cursos y materias</a><a href="${levelUrl('horario')}">Horario semanal</a><a href="${levelUrl('paquetes')}">Paquetes y ofertas</a></div></section>`;
  app.innerHTML = intro + (view === 'cursos' ? courses : view === 'horario' ? schedule : view === 'paquetes' ? packages : summary);
  document.querySelector('.package-selection')?.remove();
  document.querySelectorAll('.level-package-card').forEach((card) => {
    const offer = packageOfferFor(card.querySelector('h3').textContent.trim());
    const priceRows = card.querySelectorAll('.price-row');
    if (!priceRows.length) return;
    priceRows[0].innerHTML = offer.weeklyOffer === null
      ? '<span>Semana</span><strong>No disponible</strong>'
      : `<span>Semana</span><del>S/ ${offer.weeklyRegular}</del><strong>S/ ${offer.weeklyOffer}</strong><em>Oferta</em>`;
    priceRows[1].innerHTML = `<span>Mes: 4 sem.</span><del>S/ ${offer.monthlyRegular}</del><strong>S/ ${offer.monthlyOffer}</strong><em>Oferta</em>`;
  });
  const promoSummary = document.querySelector('.promo-summary');
  const promoContinue = document.querySelector('.custom-promo-continue');
  const promoFrequency = document.querySelector('.promo-frequency');
  const promoFrequencyButtons = document.querySelectorAll('[data-promo-frequency]');
  const promotionTurns = document.createElement('div');
  promotionTurns.className = 'promotion-turns';
  promotionTurns.hidden = true;
  promotionTurns.innerHTML = '<p>Elige tu turno para continuar:</p><button class="button button-primary" type="button" data-promo-turn="morning">Turno mañana</button><button class="button button-plain" type="button" data-promo-turn="evening">Turno tarde / noche</button>';
  promoContinue?.replaceWith(promotionTurns);
  document.querySelector('.custom-promotion .content-lead')?.replaceChildren('Si eliges un solo curso, solo aplica la promoción mensual. Al elegir más cursos podrás optar por promoción semanal o mensual, siempre que sumen al menos 3 bloques: 1 + 1 no aplica; 2 + 1, 2 + 2 y 1 + 1 + 1 sí.');
  document.querySelector('.promo-rules')?.replaceChildren(Object.assign(document.createElement('span'), { innerHTML: '<b>1 curso</b> · Solo promoción mensual' }), Object.assign(document.createElement('span'), { innerHTML: '<b>2 o más cursos y 3+ bloques</b> · Elige semanal o mensual' }));
  let selectedPromoFrequency = 'weekly';
  const updatePromotion = () => {
    const chosenCourses = Array.from(document.querySelectorAll('[data-promo-course]:checked'));
    const totalBlocks = chosenCourses.reduce((total, course) => total + Number(course.dataset.blocks), 0);
    if (!chosenCourses.length) {
      promoSummary.textContent = 'Selecciona cursos para calcular tu promoción.';
      promoFrequency.hidden = true;
      promotionTurns.hidden = true;
      return;
    }
    const weeklyRegular = totalBlocks * blockPrice;
    const weeklyOffer = weeklyRegular - blockPrice;
    const monthlyRegular = weeklyOffer * 4;
    const monthlyOffer = monthlyRegular - weeklyOffer;
    if (chosenCourses.length === 1) {
      promoFrequency.hidden = true;
      promoSummary.innerHTML = `<strong>${chosenCourses[0].value} · ${totalBlocks} ${totalBlocks === 1 ? 'bloque' : 'bloques'}.</strong> Promo mensual: <del>S/ ${monthlyRegular}</del> <b>S/ ${monthlyOffer}</b>.`;
      promotionTurns.hidden = false;
      promotionTurns.dataset.courses = chosenCourses[0].value;
      promotionTurns.dataset.package = 'Promoción mensual personalizada';
      promotionTurns.dataset.price = `S/ ${monthlyOffer} / mes`;
      promotionTurns.dataset.cadence = 'monthly';
      return;
    }
    if (totalBlocks < 3) {
      promoSummary.textContent = `Has elegido ${totalBlocks} bloques. Agrega al menos un bloque más para activar la promoción.`;
      promoFrequency.hidden = true;
      promotionTurns.hidden = true;
      return;
    }
    promoSummary.innerHTML = `<strong>${totalBlocks} bloques seleccionados.</strong> Semana: <del>S/ ${weeklyRegular}</del> <b>S/ ${weeklyOffer}</b> · Mes: <del>S/ ${monthlyRegular}</del> <b>S/ ${monthlyOffer}</b>.`;
    promoFrequency.hidden = false;
    promoFrequencyButtons.forEach((button) => {
      const weekly = button.dataset.promoFrequency === 'weekly';
      button.textContent = weekly ? `Semanal · S/ ${weeklyOffer}` : `Mensual · S/ ${monthlyOffer}`;
      button.classList.toggle('is-selected', button.dataset.promoFrequency === selectedPromoFrequency);
      button.setAttribute('aria-pressed', String(button.dataset.promoFrequency === selectedPromoFrequency));
    });
    promotionTurns.hidden = false;
    promotionTurns.dataset.courses = chosenCourses.map((course) => course.value).join('|');
    const selectedPrice = selectedPromoFrequency === 'weekly' ? weeklyOffer : monthlyOffer;
    const selectedLabel = selectedPromoFrequency === 'weekly' ? 'semanal' : 'mensual';
    promotionTurns.dataset.package = `Promoción ${selectedLabel} personalizada`;
    promotionTurns.dataset.price = `S/ ${selectedPrice} / ${selectedPromoFrequency === 'weekly' ? 'semana' : 'mes'}`;
    promotionTurns.dataset.cadence = selectedPromoFrequency;
  };
  document.querySelectorAll('[data-promo-course]').forEach((course) => course.addEventListener('change', updatePromotion));
  promoFrequencyButtons.forEach((button) => button.addEventListener('click', () => {
    selectedPromoFrequency = button.dataset.promoFrequency;
    updatePromotion();
  }));
  if (selectedCourse && promoContinue) updatePromotion();
  document.querySelectorAll('[data-promo-turn]').forEach((button) => button.addEventListener('click', () => {
    const promotionParams = new URLSearchParams({ nivel: levelKey, vista: 'horario', origen: 'paquete', paquete: promotionTurns.dataset.package, cursos: promotionTurns.dataset.courses, turno: button.dataset.promoTurn, precio: promotionTurns.dataset.price, modalidad: promotionTurns.dataset.cadence });
    location.href = `nivel.html?${promotionParams}`;
  }));
  let activeCourses = selectedCourses.length ? selectedCourses : selectedCourse ? [selectedCourse] : courseNamesForPackage(selectedPackage);
  let activeCadence = selectedCadence === 'monthly' ? 'monthly' : 'weekly';
  let activePrice = selectedPrice || '';
  let activePackage = selectedPackage || 'Promoción personalizada';
  let activeTurn = ['morning', 'evening'].includes(selectedTurn) ? selectedTurn : 'morning';
  const calculatePromotion = (coursesToPrice) => {
    const blocks = coursesToPrice.reduce((total, title) => total + (level.courses.find(([course]) => course === title)?.[2] || 0), 0);
    const weeklyRegular = blocks * blockPrice;
    const weeklyOffer = weeklyRegular - blockPrice;
    const monthlyRegular = weeklyOffer * 4;
    const monthlyOffer = monthlyRegular - weeklyOffer;
    if (coursesToPrice.length === 1) return { valid: true, blocks, weeklyRegular, weeklyOffer, monthlyRegular, monthlyOffer, cadence: 'monthly' };
    if (coursesToPrice.length > 1 && blocks >= 3) return { valid: true, blocks, weeklyRegular, weeklyOffer, monthlyRegular, monthlyOffer, cadence: activeCadence };
    return { valid: false, blocks, weeklyRegular };
  };
  if (activeCourses.length && !activePrice) {
    const initialPromotion = calculatePromotion(activeCourses);
    if (initialPromotion.valid) {
      activeCadence = initialPromotion.cadence === 'monthly' ? 'monthly' : activeCadence;
      activePrice = `S/ ${activeCadence === 'weekly' ? initialPromotion.weeklyOffer : initialPromotion.monthlyOffer} / ${activeCadence === 'weekly' ? 'semana' : 'mes'}`;
    }
  }
  if (view === 'horario') {
    const scheduleSummary = document.createElement('section');
    scheduleSummary.className = 'schedule-selection-summary';
    scheduleSummary.innerHTML = '<p class="schedule-selection-label">Tu selección</p><div class="schedule-selection-price" aria-live="polite"></div><div class="schedule-selection-frequency" hidden><button type="button" data-schedule-frequency="weekly">Semanal</button><button type="button" data-schedule-frequency="monthly">Mensual</button></div><a class="button button-primary" data-confirm-schedule-selection>Confirmar selección</a>';
    document.querySelector('.schedule-hint')?.after(scheduleSummary);
    const priceSummary = scheduleSummary.querySelector('.schedule-selection-price');
    const frequency = scheduleSummary.querySelector('.schedule-selection-frequency');
    const confirmSelection = scheduleSummary.querySelector('[data-confirm-schedule-selection]');
    const scheduleContext = document.createElement('p');
    scheduleContext.className = 'form-selection';
    document.querySelector('.shift-switch')?.before(scheduleContext);
    const courseForSubject = (subject) => level.courses.find(([course]) => normalizeCourse(course) === normalizeCourse(subject))?.[0];
    const enrollmentUrlForShift = (shift) => {
      const enrollmentParams = new URLSearchParams({ origen: 'horario', nivel: levelKey, turno: shift });
      if (activeCourses.length) enrollmentParams.set('cursos', activeCourses.join('|'));
      if (activePackage) enrollmentParams.set('paquete', activePackage);
      if (activePrice) enrollmentParams.set('precio', activePrice);
      if (activeCadence) enrollmentParams.set('modalidad', activeCadence);
      return `inscripcion.html?${enrollmentParams}#inscripción`;
    };
    const updateScheduleSelection = () => {
      const selectedCourseNames = new Set(activeCourses.map(normalizeCourse));
      document.querySelectorAll('.level-table td').forEach((cell) => {
        const subject = cell.textContent.trim();
        const course = courseForSubject(subject);
        if (!course) return;
        const selected = selectedCourseNames.has(normalizeCourse(course));
        cell.classList.toggle('is-package-subject', selected);
        cell.classList.toggle('is-package-excluded', !selected);
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-pressed', String(selected));
        cell.setAttribute('aria-label', `${course}: ${selected ? 'seleccionado' : 'no seleccionado'}`);
      });
    };
    const renderSelectionSummary = () => {
      const predefinedPackage = predefinedPackageForCourses(activeCourses);
      if (predefinedPackage) {
        const offer = packageOfferFor(predefinedPackage);
        activePackage = predefinedPackage;
        if (offer.weeklyOffer === null) activeCadence = 'monthly';
        const selectedPrice = activeCadence === 'monthly' ? offer.monthlyOffer : offer.weeklyOffer;
        activePrice = `S/ ${selectedPrice} / ${activeCadence === 'weekly' ? 'semana' : 'mes'}`;
        frequency.hidden = offer.weeklyOffer === null;
        frequency.querySelectorAll('button').forEach((button) => {
          const weekly = button.dataset.scheduleFrequency === 'weekly';
          button.classList.toggle('is-selected', weekly ? activeCadence === 'weekly' : activeCadence === 'monthly');
          button.setAttribute('aria-pressed', String(weekly ? activeCadence === 'weekly' : activeCadence === 'monthly'));
          button.textContent = weekly ? `Semanal · S/ ${offer.weeklyOffer}` : `Mensual · S/ ${offer.monthlyOffer}`;
        });
        priceSummary.innerHTML = `${offer.weeklyOffer === null ? '<b>Paquete mensual.</b>' : `<b>Semana:</b> <del>S/ ${offer.weeklyRegular}</del> S/ ${offer.weeklyOffer}`} · <b>Mes: 4 sem.</b> <del>S/ ${offer.monthlyRegular}</del> S/ ${offer.monthlyOffer}.`;
        confirmSelection.href = enrollmentUrlForShift(activeTurn);
        confirmSelection.setAttribute('aria-disabled', 'false');
        scheduleContext.hidden = false;
        scheduleContext.textContent = `Paquete actual: ${activePackage}`;
        return;
      }
      const promotion = calculatePromotion(activeCourses);
      activePackage = 'Promoción personalizada';
      if (!promotion.valid) {
        activePrice = '';
        priceSummary.textContent = activeCourses.length ? `${promotion.blocks} bloques seleccionados. Agrega cursos hasta llegar a 3 bloques para activar la promoción.` : 'Selecciona al menos un curso.';
        frequency.hidden = true;
        confirmSelection.removeAttribute('href');
        confirmSelection.setAttribute('aria-disabled', 'true');
        scheduleContext.hidden = !activeCourses.length;
        scheduleContext.textContent = predefinedPackage ? `Paquete actual: ${activePackage}` : 'Promoción personalizada: —';
        return;
      }
      if (activeCourses.length === 1) {
        activeCadence = 'monthly';
        activePrice = `S/ ${promotion.monthlyOffer} / mes`;
        frequency.hidden = true;
        priceSummary.innerHTML = `<b>${promotion.blocks} ${promotion.blocks === 1 ? 'bloque' : 'bloques'} seleccionado${promotion.blocks === 1 ? '' : 's'}.</b> Mensual: <del>S/ ${promotion.monthlyRegular}</del> S/ ${promotion.monthlyOffer} (3 semanas).`;
      } else {
        frequency.hidden = false;
        frequency.querySelectorAll('button').forEach((button) => {
          const selected = button.dataset.scheduleFrequency === activeCadence;
          button.classList.toggle('is-selected', selected);
          button.setAttribute('aria-pressed', String(selected));
          button.textContent = button.dataset.scheduleFrequency === 'weekly' ? `Semanal · S/ ${promotion.weeklyOffer}` : `Mensual · S/ ${promotion.monthlyOffer}`;
        });
        priceSummary.innerHTML = `<b>${promotion.blocks} bloques seleccionados.</b> Semana: <del>S/ ${promotion.weeklyRegular}</del> S/ ${promotion.weeklyOffer} · Mes: <del>S/ ${promotion.monthlyRegular}</del> S/ ${promotion.monthlyOffer}.`;
        activePrice = `S/ ${activeCadence === 'weekly' ? promotion.weeklyOffer : promotion.monthlyOffer} / ${activeCadence === 'weekly' ? 'semana' : 'mes'}`;
      }
      confirmSelection.href = enrollmentUrlForShift(activeTurn);
      confirmSelection.setAttribute('aria-disabled', 'false');
      scheduleContext.hidden = false;
      scheduleContext.textContent = predefinedPackage ? `Paquete actual: ${activePackage}` : `Promoción personalizada: ${activePrice}`;
    };
    const toggleCourse = (course) => {
      activeCourses = activeCourses.includes(course) ? activeCourses.filter((title) => title !== course) : [...activeCourses, course];
      updateScheduleSelection();
      renderSelectionSummary();
    };
    document.querySelectorAll('.level-table td').forEach((cell) => {
      const course = courseForSubject(cell.textContent.trim());
      if (!course) return;
      cell.addEventListener('click', () => toggleCourse(course));
      cell.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggleCourse(course);
      });
    });
    frequency.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
      activeCadence = button.dataset.scheduleFrequency;
      renderSelectionSummary();
    }));
    updateScheduleSelection();
    renderSelectionSummary();
  }
  document.querySelectorAll('.course-grid article').forEach((card, index) => {
    const [title] = level.courses[index];
    const link = card.querySelector('a');
    link.href = `${base}&vista=paquetes&curso=${encodeURIComponent(title)}&origen=curso`;
    link.textContent = 'Ver paquetes relacionados';
  });
  if (view === 'inicio') {
    const levelContact = document.createElement('a');
    levelContact.href = `inscripcion.html?${new URLSearchParams({ origen: 'nivel', nivel: levelKey })}#inscripción`;
    levelContact.textContent = `Consultar ${level.name}`;
    document.querySelector('.overview-links')?.append(levelContact);
  }
  if (view === 'paquetes' && selectedCourse) {
    document.querySelector('.level-content h2').textContent = `Paquetes para ${selectedCourse}.`;
    document.querySelector('.content-lead').textContent = 'Estas opciones incluyen el curso que seleccionaste. También puedes comparar todos los paquetes.';
    document.querySelectorAll('.level-package-card').forEach((card) => {
      card.hidden = !card.querySelector('.package-subjects').textContent.includes(selectedCourse);
    });
  }
  const shiftTimes = {
    morning: ['08:00 - 09:30', '09:30 - 09:50', '09:50 - 11:20', '11:20 - 11:40', '11:40 - 13:10', '13:10 - 13:30', '13:30 - 15:00'].slice(0, scheduleRows.length),
    evening: ['15:00 - 16:30', '16:30 - 16:50', '16:50 - 18:20', '18:20 - 18:40', '18:40 - 20:10', '20:10 - 20:30', '20:30 - 22:00'].slice(0, scheduleRows.length),
  };
  document.querySelectorAll('.shift-button').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.shift-button').forEach((item) => item.classList.toggle('is-selected', item === button));
      document.querySelectorAll('[data-time]').forEach((cell) => { cell.textContent = shiftTimes[button.dataset.shift][cell.dataset.time]; });
      activeTurn = button.dataset.shift;
      const confirmation = document.querySelector('[data-confirm-schedule-selection]');
      if (confirmation?.getAttribute('aria-disabled') !== 'true') confirmation?.setAttribute('href', enrollmentUrlForShift(activeTurn));
    });
  });
  document.querySelectorAll('[data-time]').forEach((cell) => { cell.textContent = shiftTimes[activeTurn][cell.dataset.time]; });
  document.querySelectorAll('.shift-button').forEach((button) => button.classList.toggle('is-selected', button.dataset.shift === activeTurn));
  document.querySelectorAll('.choose-package').forEach((button) => {
    const packageName = button.dataset.package;
    const offer = packageOfferFor(packageName);
    const actions = document.createElement('div');
    actions.className = 'package-turn-actions';
    actions.innerHTML = '<button class="choose-package" type="button" data-turn="morning">Turno mañana</button><button class="choose-package" type="button" data-turn="evening">Turno tarde / noche</button>';
    actions.querySelectorAll('button').forEach((turnButton) => turnButton.addEventListener('click', () => {
      const cadence = offer.weeklyOffer === null ? 'monthly' : 'weekly';
      const price = cadence === 'weekly' ? offer.weeklyOffer : offer.monthlyOffer;
      const packageParams = new URLSearchParams({ nivel: levelKey, vista: 'horario', origen: 'paquete', paquete: packageName, cursos: offer.courses.join('|'), turno: turnButton.dataset.turn, precio: `S/ ${price} / ${cadence === 'weekly' ? 'semana' : 'mes'}`, modalidad: cadence });
      location.href = `nivel.html?${packageParams}`;
    }));
    button.replaceWith(actions);
  });
  document.querySelectorAll('.level-package-filter').forEach((filter) => {
    filter.addEventListener('click', () => {
      const type = filter.dataset.filter;
      document.querySelectorAll('.level-package-filter').forEach((button) => {
        const selected = button === filter;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      document.querySelectorAll('.level-package-card').forEach((card) => {
        card.hidden = type !== 'all' && card.dataset.type !== type;
      });
    });
  });
}

if (levelSchedules[currentPage]) {
  const levelPage = levelSchedules[currentPage];
  const overview = document.querySelector('.level-overview');
  if (overview) {
    overview.id = 'cursos';
    const overviewDetails = currentPage === 'primaria.html'
      ? ['Clases en vivo', 'Aprendizaje guiado y práctico', 'Material de apoyo', 'Recursos para continuar avanzando']
      : ['Clases en vivo', 'Áreas organizadas por objetivo', 'Material de apoyo', 'Prácticas para reforzar lo aprendido'];
    const overviewAside = overview.querySelector('aside');
    if (overviewAside) overviewAside.innerHTML = `<strong>${overviewDetails[0]}</strong><span>${overviewDetails[1]}</span><strong>${overviewDetails[2]}</strong><span>${overviewDetails[3]}</span>`;
    overview.insertAdjacentHTML('afterend', `<section id="horario" class="interface-schedule section"><div><p class="eyebrow">${levelPage.label}</p><h2>${levelPage.title}</h2><p>Elige mañana o tarde/noche. Cada bloque dura 90 minutos y las clases se organizan de lunes a sábado.</p></div><ol>${levelPage.subjects.map((subject, index) => `<li><span>Bloque ${index + 1}</span><strong>${subject}</strong></li>`).join('')}</ol></section>`);
    const packages = document.querySelector('.packages');
    if (packages) packages.id = 'paquetes';
  }
}

if (currentPage === 'programas.html') {
  const eyebrow = document.querySelector('.page-intro .eyebrow');
  if (eyebrow) eyebrow.textContent = 'LUMVEA PREUNIVERSITARIA';
  const intro = document.querySelector('.page-intro');
  const packages = document.querySelector('.packages');
  const blocks = document.querySelector('.block-times');
  if (intro) intro.id = 'cursos';
  if (packages) packages.id = 'paquetes';
  if (blocks) blocks.id = 'horario';
}

if (currentPage === 'horarios.html') {
  const schedules = document.querySelectorAll('.schedule');
  const scheduleTarget = schedules[schedules.length - 1];
  const rows = [
    ['08:00 - 09:30', 'Trigonometría', 'Lenguaje', 'Historia Universal', 'Economía', 'Álgebra', 'Aritmética'],
    ['09:50 - 11:20', 'Historia del Perú', 'Razonamiento Matemático', 'Razonamiento Verbal', 'Química', 'Literatura', 'Física'],
    ['11:40 - 13:10', 'Física', 'Biología', 'Cívica', 'Geometría', 'Filosofía', 'Biología'],
    ['13:30 - 15:00', 'Psicología', 'Química', 'Geografía', 'Aritmética', 'Inglés', 'Geometría'],
  ];
  if (scheduleTarget) {
    scheduleTarget.insertAdjacentHTML('afterend', `<section class="weekly-schedule section"><div class="weekly-schedule-heading"><div><p class="eyebrow">VISTA SEMANAL</p><h2>Horario preuniversitario.</h2></div><p>Turno mañana. El turno tarde/noche replica las materias en sus propios bloques.</p></div><div class="schedule-table-wrap"><table><caption class="sr-only">Horario semanal preuniversitario</caption><thead><tr><th>Hora</th><th>Lunes</th><th>Martes</th><th>Miércoles</th><th>Jueves</th><th>Viernes</th><th>Sábado</th></tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell, index) => `<${index === 0 ? 'th scope="row"' : 'td'}>${cell}</${index === 0 ? 'th' : 'td'}>`).join('')}</tr>`).join('')}</tbody></table></div></section>`);
  }
}

if (currentPage === 'index.html') {
  const heroEyebrow = document.querySelector('.hero .eyebrow');
  const heroTitle = document.querySelector('.hero h1');
  const heroText = document.querySelector('.hero-text');
  const heroFacts = document.querySelector('.hero-facts');
  const heroActions = document.querySelector('.hero-actions');
  if (heroEyebrow) heroEyebrow.textContent = 'EDUCACIÓN VIRTUAL PARA CADA ETAPA';
  if (heroTitle) heroTitle.innerHTML = 'Aprende, avanza y alcanza <span>tu próxima meta.</span>';
  if (heroText) heroText.textContent = 'Acompañamos a estudiantes de primaria, secundaria y preuniversitaria con clases en vivo, práctica y una ruta de aprendizaje clara.';
  if (heroActions) {
    heroActions.classList.add('overview-links');
    heroActions.innerHTML = '<a href="nivel.html?nivel=primaria&vista=inicio">Ver Primaria</a><a href="nivel.html?nivel=secundaria&vista=inicio">Ver Secundaria</a><a href="nivel.html?nivel=preuniversitaria&vista=inicio">Ver Preuniversitaria</a>';
  }
  if (heroFacts) heroFacts.innerHTML = '<div><dt>Niveles</dt><dd>Primaria, secundaria y preuniversitaria</dd></div><div><dt>Clases</dt><dd>En vivo</dd></div><div><dt>Modalidad</dt><dd>100% virtual</dd></div>';
  document.querySelector('.method')?.remove();
  document.querySelector('.enrollment')?.remove();
}

function showBlocks(blocks) {
  blockTimes.innerHTML = blocks.map((time, index) => `<span>Bloque ${index + 1}<br /><strong>${time}</strong></span>`).join('');
}

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const open = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navigation.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

if (!menuButton && navigation) {
  const internalMenuButton = document.createElement('button');
  internalMenuButton.className = 'menu-button';
  internalMenuButton.type = 'button';
  internalMenuButton.setAttribute('aria-expanded', 'false');
  internalMenuButton.setAttribute('aria-controls', 'site-nav');
  internalMenuButton.innerHTML = '<span class="sr-only">Abrir menu</span><span aria-hidden="true">Menu</span>';
  navigation.id = 'site-nav';
  navigation.before(internalMenuButton);

  internalMenuButton.addEventListener('click', () => {
    const open = navigation.classList.toggle('is-open');
    internalMenuButton.setAttribute('aria-expanded', String(open));
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navigation.classList.remove('is-open');
      internalMenuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

turnButtons.forEach((turnButton) => {
  turnButton.addEventListener('click', () => {
    turnButtons.forEach((button) => {
      const selected = button === turnButton;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    turnSummary.textContent = `Turno seleccionado: ${turnButton.dataset.turn}. Los temas se dictan en bloques de 90 minutos.`;
    if (blockTimes) showBlocks(turnButton.dataset.turn.startsWith('Mañana') ? timeBlocks.morning : timeBlocks.evening);
  });
});

packageFilters.forEach((filter) => {
  filter.addEventListener('click', () => {
    const type = filter.dataset.filter;
    packageFilters.forEach((button) => {
      const selected = button === filter;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    packageCards.forEach((card) => {
      card.hidden = type !== 'all' && card.dataset.type !== type;
    });
  });
});

const legacyLevelByPage = {
  'primaria.html': 'primaria',
  'secundaria.html': 'secundaria',
  'programas.html': 'preuniversitaria',
};
const legacyLevel = legacyLevelByPage[currentPage];
if (legacyLevel) {
  document.querySelectorAll('.package-card').forEach((card) => {
    if (card.querySelector('.choose-package')) return;
    const packageName = card.querySelector('h3')?.textContent.trim();
    if (!packageName) return;
    const button = document.createElement('a');
    button.className = 'choose-package';
    button.href = `nivel.html?nivel=${legacyLevel}&vista=horario&origen=paquete&paquete=${encodeURIComponent(packageName)}`;
    button.textContent = 'Elegir paquete';
    card.append(button);
  });
}

if (form && form.isConnected) {
  const enrollmentParams = new URLSearchParams(location.search);
  const selectedLevel = enrollmentParams.get('nivel');
  const selectedCourses = (enrollmentParams.get('cursos') || '').split('|').filter(Boolean);
  const selectedCourse = selectedCourses.join(', ') || enrollmentParams.get('curso');
  const selectedPackage = enrollmentParams.get('paquete');
  const selectedPrice = enrollmentParams.get('precio');
  const selectedCadence = enrollmentParams.get('modalidad');
  const selectedTurn = ['morning', 'evening'].includes(enrollmentParams.get('turno')) ? enrollmentParams.get('turno') : '';
  const selectedOrigin = ['directo', 'inicio', 'nivel', 'curso', 'paquete', 'horario'].includes(enrollmentParams.get('origen')) ? enrollmentParams.get('origen') : 'directo';
  const turnLabel = selectedTurn === 'morning' ? 'Turno mañana' : selectedTurn === 'evening' ? 'Turno tarde / noche' : '';
  const requestType = selectedLevel && selectedCourse && selectedPackage && selectedTurn
    ? 'Inscripción completa'
    : selectedPackage && selectedTurn
      ? 'Consulta por paquete y horario'
      : selectedPackage
        ? 'Consulta por paquete'
        : selectedTurn
          ? 'Consulta por horario'
          : selectedCourse
            ? 'Consulta por curso'
            : selectedLevel
              ? 'Consulta por nivel'
              : 'Información general';
  const levelField = form.querySelector('select[name="nivel"]');
  if (selectedLevel && levelField) {
    const option = Array.from(levelField.options).find((item) => item.value.toLowerCase() === selectedLevel || item.text.toLowerCase() === selectedLevel);
    if (option) levelField.value = option.value;
  }
  const contactFields = [form.querySelector('#name'), form.querySelector('#phone')].filter(Boolean);
  const [nameField, phoneField] = contactFields;
  form.querySelectorAll('fieldset[disabled]').forEach((fieldset) => { fieldset.disabled = false; });
  contactFields.forEach((field) => {
    field.disabled = false;
    field.readOnly = false;
    field.removeAttribute('aria-disabled');
    field.tabIndex = 0;
    field.closest('.form-row').hidden = false;
    field.addEventListener('pointerdown', () => { field.focus(); });
  });
  if (nameField) {
    nameField.type = 'text';
    nameField.autocomplete = 'name';
  }
  if (phoneField) {
    phoneField.type = 'tel';
    phoneField.autocomplete = 'tel';
    phoneField.inputMode = 'numeric';
    phoneField.maxLength = 9;
    phoneField.placeholder = '987654321';
    phoneField.addEventListener('input', () => { phoneField.value = phoneField.value.replace(/\D/g, '').slice(0, 9); });
  }
  form.querySelectorAll('.form-row').forEach((row) => {
    const controls = Array.from(row.querySelectorAll('input, select, textarea'));
    if (!controls.some((control) => contactFields.includes(control))) {
      controls.forEach((control) => { control.required = false; control.disabled = true; });
      row.hidden = true;
    }
  });
  form.querySelectorAll('select').forEach((select) => {
    select.required = false;
    select.disabled = true;
    select.hidden = true;
    const label = select.id ? form.querySelector(`label[for="${select.id}"]`) : select.previousElementSibling;
    if (label?.tagName === 'LABEL') label.hidden = true;
    const wrapper = select.closest('.form-row') || select.parentElement;
    if (wrapper && wrapper !== form) wrapper.hidden = true;
  });
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.textContent = 'Continuar por WhatsApp';
  const honeypot = document.createElement('input');
  honeypot.type = 'text';
  honeypot.name = 'website';
  honeypot.autocomplete = 'off';
  honeypot.tabIndex = -1;
  honeypot.setAttribute('aria-hidden', 'true');
  honeypot.className = 'form-honeypot';
  form.prepend(honeypot);
  const consent = document.createElement('label');
  consent.className = 'form-consent';
  consent.innerHTML = '<input type="checkbox" required /> <span>Acepto que LUMVEA use mis datos para atender esta solicitud.</span>';
  if (submitButton) form.insertBefore(consent, submitButton);
  const turnstile = document.createElement('div');
  turnstile.className = 'cf-turnstile';
  let turnstileWidgetId;
  const renderTurnstile = () => {
    if (window.turnstile && turnstileWidgetId === undefined) {
      turnstileWidgetId = window.turnstile.render(turnstile, { sitekey: turnstileSiteKey });
    }
  };
  if (submitButton) form.insertBefore(turnstile, submitButton);
  const existingTurnstileScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
  if (!existingTurnstileScript) {
    const turnstileScript = document.createElement('script');
    turnstileScript.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    turnstileScript.async = true;
    turnstileScript.defer = true;
    turnstileScript.addEventListener('load', renderTurnstile);
    document.head.append(turnstileScript);
  } else {
    existingTurnstileScript.addEventListener('load', renderTurnstile);
    renderTurnstile();
  }
  if (selectedLevel || selectedCourse || selectedPackage || selectedTurn) {
    const selection = document.createElement('p');
    selection.className = 'form-selection';
    const details = [
      selectedLevel && `Nivel: ${selectedLevel}`,
      selectedCourse && `Curso: ${selectedCourse}`,
      selectedPackage && `Paquete o promoción: ${selectedPackage}`,
      selectedPrice && `Precio elegido: ${selectedPrice}`,
      selectedCadence && `Modalidad: ${selectedCadence === 'weekly' ? 'semanal' : 'mensual'}`,
      turnLabel && `Turno: ${turnLabel}`,
    ].filter(Boolean);
    selection.textContent = `${requestType}. ${details.join(' · ')}`;
    form.prepend(selection);
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      message.textContent = 'Completa los campos requeridos para enviar tu consulta.';
      form.reportValidity();
      return;
    }
    const turnstileToken = form.querySelector('[name="cf-turnstile-response"]')?.value;
    if (honeypot.value || !/^9\d{8}$/.test(phoneField.value.trim()) || !turnstileToken) {
      message.textContent = honeypot.value ? 'No se pudo procesar la solicitud.' : !turnstileToken ? 'Completa la verificación de seguridad para continuar.' : 'Ingresa un celular peruano válido de 9 dígitos que empiece con 9.';
      return;
    }
    // Opening a tab during the click avoids popup blockers after the network request.
    const whatsappWindow = window.open('', '_blank');
    if (whatsappWindow) whatsappWindow.opener = null;
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    message.textContent = 'Guardando tu solicitud...';
    try {
      const savedRequest = await saveRequest({
        nombre_completo: nameField.value.trim(),
        celular: phoneField.value.trim(),
        nivel: selectedLevel || null,
        curso: selectedCourse || null,
        paquete: selectedPackage || null,
        modalidad: selectedCadence || null,
        turno: turnLabel || null,
        origen: selectedOrigin,
        tipo_solicitud: requestType,
        turnstile_token: turnstileToken,
      });
      const confirmedPromotion = savedRequest.solicitud;
      const confirmedCourse = confirmedPromotion?.courses?.join(', ') || selectedCourse;
      const confirmedPackage = confirmedPromotion?.packageName || selectedPackage;
      const confirmedPrice = confirmedPromotion?.price || selectedPrice;
      const confirmedCadence = confirmedPromotion?.cadence || selectedCadence;
      const whatsappMessage = [
        `Hola, quiero recibir información de LUMVEA. Tipo de solicitud: ${requestType}.`,
        '',
        'Datos de la solicitud:',
        `Origen: ${selectedOrigin}`,
        ...(selectedLevel ? [`Nivel: ${selectedLevel}`] : []),
        ...(confirmedCourse ? [`Curso: ${confirmedCourse}`] : []),
        ...(confirmedPackage ? [`Paquete o promoción: ${confirmedPackage}`] : []),
        ...(confirmedPrice ? [`Precio confirmado: ${confirmedPrice}`] : []),
        ...(confirmedCadence ? [`Modalidad: ${confirmedCadence === 'weekly' ? 'Semanal' : 'Mensual'}`] : []),
        ...(turnLabel ? [`Turno: ${turnLabel}`] : []),
        `Nombre completo: ${nameField.value.trim()}`,
        `Celular: ${phoneField.value.trim()}`,
      ].join('\n');
      if (whatsappWindow) {
        whatsappWindow.location.href = whatsappLink(whatsappMessage);
        message.textContent = 'Solicitud guardada. Abrimos WhatsApp con los datos enviados.';
      } else {
        const link = document.createElement('a');
        link.href = whatsappLink(whatsappMessage);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Abrir WhatsApp';
        message.replaceChildren('Solicitud guardada. ', link);
      }
      form.reset();
      if (turnstileWidgetId !== undefined && window.turnstile) window.turnstile.reset(turnstileWidgetId);
    } catch (error) {
      whatsappWindow?.close();
      if (turnstileWidgetId !== undefined && window.turnstile) window.turnstile.reset(turnstileWidgetId);
      message.textContent = error instanceof Error ? error.message : 'No pudimos guardar tu solicitud. Intenta nuevamente en unos minutos.';
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

document.querySelectorAll('.site-footer p').forEach((paragraph) => {
  if (!paragraph.querySelector('#year')) paragraph.textContent = 'Educación virtual para primaria, secundaria y preuniversitaria.';
});
document.querySelectorAll('#year').forEach((year) => { year.textContent = new Date().getFullYear(); });
