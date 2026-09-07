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
    { href: 'aula-virtual.html', label: 'Aula virtual' },
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
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('No se pudo guardar la solicitud.');
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
  const levels = {
    primaria: {
      name: 'Primaria',
      lead: 'Bases firmes, curiosidad y acompañamiento para aprender con confianza.',
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      courses: [['Razonamiento Matemático', 'Matemáticas'], ['Aritmética', 'Matemáticas'], ['Álgebra', 'Matemáticas'], ['Geometría', 'Matemáticas'], ['Lenguaje', 'Comunicación'], ['Comprensión Lectora', 'Comunicación'], ['Razonamiento Verbal', 'Comunicación'], ['Personal Social', 'Ciencias Sociales'], ['Ciencia y Tecnología', 'Ciencias Naturales'], ['Inglés', 'Inglés']],
      scheduleRows: [['Aritmética', 'Lenguaje', 'Personal social', 'Inglés', 'Álgebra', 'Simulacro'], ['Geometría', 'Razonamiento matemático', 'Comprensión lectora', 'Comprensión lectora', 'Inglés', ''], ['Ciencia y tecnología', 'Razonamiento verbal', 'Aritmética', 'Geometría', 'Lenguaje', '']],
      packages: [['Matemática', 'S/ 15', 'S/ 45'], ['Comunicación', 'S/ 9', 'S/ 27'], ['Ciencias y social', 'S/ 3', 'S/ 9'], ['Inglés', 'S/ 3', 'S/ 9'], ['Matemática + Inglés', 'S/ 21', 'S/ 63'], ['Comunicación + Inglés', 'S/ 15', 'S/ 45'], ['Ciencias + Inglés', 'S/ 9', 'S/ 27'], ['Matemática + Comunicación + Inglés', 'S/ 33', 'S/ 99'], ['Matemática + Ciencias + Inglés', 'S/ 27', 'S/ 81'], ['Comunicación + Ciencias + Inglés', 'S/ 21', 'S/ 63'], ['Paquete completo', 'S/ 39', 'S/ 117']],
    },
    secundaria: {
      name: 'Secundaria',
      lead: 'Refuerzo por áreas para avanzar con método hacia nuevos retos académicos.',
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      courses: [['Razonamiento Matemático', 'Matemáticas'], ['Aritmética', 'Matemáticas'], ['Álgebra', 'Matemáticas'], ['Trigonometría', 'Matemáticas'], ['Geometría', 'Matemáticas'], ['Lenguaje', 'Comunicación'], ['Literatura', 'Comunicación'], ['Razonamiento Verbal', 'Comunicación'], ['Física', 'Ciencias Naturales'], ['Química', 'Ciencias Naturales'], ['Biología', 'Ciencias Naturales'], ['Inglés', 'Inglés']],
      scheduleRows: [['Trigonometría', 'Lenguaje', 'Álgebra', 'Física', 'Inglés', 'Razonamiento matemático', 'Simulacro'], ['Geometría', 'Razonamiento matemático', 'Razonamiento verbal', 'Química', 'Literatura', 'Química', ''], ['Física', 'Biología', 'Aritmética', 'Geometría', 'Aritmética', 'Biología', '']],
      packages: [['Matemática', 'S/ 21', 'S/ 63'], ['Comunicación', 'S/ 9', 'S/ 18'], ['Ciencias naturales', 'S/ 15', 'S/ 45'], ['Matemática + Inglés', 'S/ 24', 'S/ 72'], ['Comunicación + Inglés', 'S/ 9', 'S/ 27'], ['Ciencias naturales + Inglés', 'S/ 18', 'S/ 54'], ['Matemática + Comunicación + Inglés', 'S/ 33', 'S/ 99'], ['Matemática + Ciencias + Inglés', 'S/ 42', 'S/ 126'], ['Ciencias + Comunicación + Inglés', 'S/ 27', 'S/ 81'], ['Paquete completo', 'S/ 51', 'S/ 153']],
    },
    preuniversitaria: {
      name: 'Preuniversitaria',
      lead: 'Cursos, turnos y práctica para organizar una ruta de preparación universitaria.',
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      courses: [['Razonamiento Matemático', 'Matemáticas'], ['Aritmética', 'Matemáticas'], ['Álgebra', 'Matemáticas'], ['Trigonometría', 'Matemáticas'], ['Geometría', 'Matemáticas'], ['Lenguaje', 'Comunicación'], ['Literatura', 'Comunicación'], ['Razonamiento Verbal', 'Comunicación'], ['Psicología', 'Ciencias Sociales'], ['Educación Cívica', 'Ciencias Sociales'], ['Historia del Perú', 'Ciencias Sociales'], ['Historia Universal', 'Ciencias Sociales'], ['Geografía', 'Ciencias Sociales'], ['Economía', 'Ciencias Sociales'], ['Filosofía', 'Ciencias Sociales'], ['Física', 'Ciencias Naturales'], ['Química', 'Ciencias Naturales'], ['Biología', 'Ciencias Naturales'], ['Inglés', 'Inglés']],
      scheduleRows: [['Trigonometría', 'Lenguaje', 'Historia universal', 'Economía', 'Álgebra', 'Aritmética', 'Simulacro'], ['Historia del Perú', 'Razonamiento matemático', 'Razonamiento verbal', 'Química', 'Literatura', 'Física', ''], ['Física', 'Biología', 'Cívica', 'Geometría', 'Filosofía', 'Biología', ''], ['Psicología', 'Química', 'Geografía', 'Aritmética', 'Inglés', 'Geometría', '']],
      packages: [['Matemática', 'S/ 24', 'S/ 70'], ['Comunicación', 'S/ 8', 'S/ 24'], ['Ciencias sociales', 'S/ 24', 'S/ 70'], ['Ciencias naturales', 'S/ 20', 'S/ 60'], ['Matemática + Inglés', 'S/ 28', 'S/ 84'], ['Comunicación + Inglés', 'S/ 12', 'S/ 36'], ['Sociales + Inglés', 'S/ 28', 'S/ 84'], ['Naturales + Inglés', 'S/ 24', 'S/ 60'], ['Matemática + Comunicación + Inglés', 'S/ 40', 'S/ 120'], ['Matemática + Naturales + Inglés', 'S/ 52', 'S/ 156'], ['Naturales + Comunicación + Inglés', 'S/ 36', 'S/ 108'], ['Paquete completo', 'S/ 92', 'S/ 276']],
    },
  };
  const level = levels[levelKey] || levels.primaria;
  const app = document.querySelector('#level-interface');
  const base = `nivel.html?nivel=${levelKey}`;
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
  const subnav = `<nav class="level-subnav" aria-label="Secciones de ${level.name}"><a class="${view === 'inicio' ? 'is-current' : ''}" href="${base}&vista=inicio">Resumen</a><a class="${view === 'cursos' ? 'is-current' : ''}" href="${base}&vista=cursos">Cursos</a><a class="${view === 'horario' ? 'is-current' : ''}" href="${base}&vista=horario">Horario</a><a class="${view === 'paquetes' ? 'is-current' : ''}" href="${base}&vista=paquetes">Paquetes</a></nav>`;
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
  const subjectsFor = (title) => {
    if (title === 'Paquete completo') return Object.values(subjectGroups).join(' · ');
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
  const summary = `<section class="level-content section level-start"><p class="eyebrow">EMPIEZA AQUÍ</p><h2>¿Qué quieres revisar?</h2><p class="content-lead">Selecciona una opción para conocer las materias, ver el horario semanal o comparar los paquetes disponibles.</p><div class="overview-links"><a href="${base}&vista=cursos">Cursos y materias</a><a href="${base}&vista=horario">Horario semanal</a><a href="${base}&vista=paquetes">Paquetes y ofertas</a></div></section>`;
  app.innerHTML = intro + (view === 'cursos' ? courses : view === 'horario' ? schedule : view === 'paquetes' ? packages : summary);
  document.querySelectorAll('.course-grid article').forEach((card, index) => {
    const [title] = level.courses[index];
    const link = card.querySelector('a');
    link.href = `${base}&vista=paquetes&curso=${encodeURIComponent(title)}`;
    link.textContent = 'Ver paquetes relacionados';
  });
  if (view === 'paquetes' && selectedCourse) {
    document.querySelector('.level-content h2').textContent = `Paquetes para ${selectedCourse}.`;
    document.querySelector('.content-lead').textContent = 'Estas opciones incluyen el curso que seleccionaste. También puedes comparar todos los paquetes.';
    document.querySelectorAll('.level-package-card').forEach((card) => {
      card.hidden = !card.querySelector('.package-subjects').textContent.includes(selectedCourse);
    });
  }
  const shiftContact = document.createElement('a');
  shiftContact.className = 'button button-primary schedule-contact';
  shiftContact.textContent = 'Quiero este turno';
  const shiftSwitch = document.querySelector('.shift-switch');
  if (shiftSwitch) shiftSwitch.after(shiftContact);
  const shiftTimes = {
    morning: ['08:00 - 09:30', '09:30 - 09:50', '09:50 - 11:20', '11:20 - 11:40', '11:40 - 13:10', '13:10 - 13:30', '13:30 - 15:00'].slice(0, scheduleRows.length),
    evening: ['15:00 - 16:30', '16:30 - 16:50', '16:50 - 18:20', '18:20 - 18:40', '18:40 - 20:10', '20:10 - 20:30', '20:30 - 22:00'].slice(0, scheduleRows.length),
  };
  document.querySelectorAll('.shift-button').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.shift-button').forEach((item) => item.classList.toggle('is-selected', item === button));
      document.querySelectorAll('[data-time]').forEach((cell) => { cell.textContent = shiftTimes[button.dataset.shift][cell.dataset.time]; });
      shiftContact.href = `index.html?nivel=${levelKey}&turno=${button.dataset.shift}#inscripción`;
    });
  });
  document.querySelectorAll('[data-time]').forEach((cell) => { cell.textContent = shiftTimes.morning[cell.dataset.time]; });
  document.querySelectorAll('.choose-package').forEach((button) => {
    button.addEventListener('click', () => {
      location.href = `index.html?nivel=${levelKey}&paquete=${encodeURIComponent(button.dataset.package)}#inscripción`;
    });
  });
  shiftContact.href = `index.html?nivel=${levelKey}&turno=morning#inscripción`;
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
  if (heroEyebrow) heroEyebrow.textContent = 'EDUCACIÓN VIRTUAL PARA CADA ETAPA';
  if (heroTitle) heroTitle.innerHTML = 'Aprende, avanza y alcanza <span>tu próxima meta.</span>';
  if (heroText) heroText.textContent = 'Acompañamos a estudiantes de primaria, secundaria y preuniversitaria con clases en vivo, práctica y una ruta de aprendizaje clara.';
  if (heroFacts) heroFacts.innerHTML = '<div><dt>Niveles</dt><dd>Primaria, secundaria y preuniversitaria</dd></div><div><dt>Clases</dt><dd>En vivo</dd></div><div><dt>Modalidad</dt><dd>100% virtual</dd></div>';
  const method = document.querySelector('.method');
  if (method) {
    method.insertAdjacentHTML('afterend', '<section class="level-router section"><p class="eyebrow">ELIGE TU NIVEL</p><h2>Encuentra el acompañamiento que necesitas.</h2><div><a href="nivel.html?nivel=primaria&vista=inicio"><span>01</span><strong>Primaria</strong><small>Construye bases y hábitos de estudio.</small></a><a href="nivel.html?nivel=secundaria&vista=inicio"><span>02</span><strong>Secundaria</strong><small>Refuerza, practica y gana confianza.</small></a><a href="nivel.html?nivel=preuniversitaria&vista=inicio"><span>03</span><strong>Preuniversitaria</strong><small>Prepárate con una ruta para postular.</small></a></div></section>');
  }
  const levelCards = [
    ['Primaria', 'Construye bases y hábitos de estudio.', 'Matemática, comunicación, ciencias e inglés', 'Clases en vivo y material de práctica', 'Conocer Primaria'],
    ['Secundaria', 'Refuerza, practica y gana confianza.', 'Matemática, letras, ciencias e inglés', 'Práctica guiada y seguimiento', 'Conocer Secundaria'],
    ['Preuniversitaria', 'Prepárate con una ruta para postular.', 'Cursos por áreas y turnos flexibles', 'Simulacros y ruta de estudio', 'Conocer Preuniversitaria'],
  ];
  document.querySelectorAll('.level-router a').forEach((card, index) => {
    const [title, description, detailOne, detailTwo, action] = levelCards[index];
    card.innerHTML = `<span>0${index + 1}</span><strong>${title}</strong><p>${description}</p><ul><li>${detailOne}</li><li>${detailTwo}</li></ul><small>${action} <b>→</b></small>`;
  });
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

if (form) {
  const enrollmentParams = new URLSearchParams(location.search);
  const selectedLevel = enrollmentParams.get('nivel');
  const selectedPackage = enrollmentParams.get('paquete');
  const selectedTurn = enrollmentParams.get('turno');
  const levelField = form.querySelector('select[name="nivel"]');
  if (selectedLevel && levelField) {
    const option = Array.from(levelField.options).find((item) => item.value.toLowerCase() === selectedLevel || item.text.toLowerCase() === selectedLevel);
    if (option) levelField.value = option.value;
  }
  const contactFields = [form.querySelector('input[type="text"]'), form.querySelector('input[type="tel"]')].filter(Boolean);
  const [nameField, phoneField] = contactFields;
  contactFields.forEach((field) => {
    field.disabled = false;
    field.readOnly = false;
    field.removeAttribute('aria-disabled');
  });
  if (nameField) nameField.autocomplete = 'name';
  if (phoneField) {
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
  turnstile.dataset.sitekey = turnstileSiteKey;
  if (submitButton) form.insertBefore(turnstile, submitButton);
  if (!document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
    const turnstileScript = document.createElement('script');
    turnstileScript.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    turnstileScript.async = true;
    turnstileScript.defer = true;
    document.head.append(turnstileScript);
  }
  if (selectedPackage || selectedTurn) {
    const selection = document.createElement('p');
    selection.className = 'form-selection';
    const turnLabel = selectedTurn === 'morning' ? 'Turno mañana' : selectedTurn === 'evening' ? 'Turno tarde / noche' : '';
    selection.textContent = `Programa de interés: ${selectedPackage || turnLabel}${selectedLevel ? ` · ${selectedLevel}` : ''}`;
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
    const turnLabel = selectedTurn === 'morning' ? 'Turno mañana' : selectedTurn === 'evening' ? 'Turno tarde / noche' : '';
    const selection = [selectedPackage && `Paquete: ${selectedPackage}`, turnLabel, selectedLevel && `Nivel: ${selectedLevel}`].filter(Boolean).join('\n');
    try {
      await saveRequest({
        nombre_completo: nameField.value.trim(),
        celular: phoneField.value.trim(),
        nivel: selectedLevel || null,
        paquete: selectedPackage || null,
        turno: turnLabel || null,
        turnstile_token: turnstileToken,
      });
      window.open(whatsappLink(`Hola, quiero solicitar información e inscribirme en LUMVEA.\n${selection}\nNombre completo: ${nameField.value.trim()}\nCelular: ${phoneField.value.trim()}`), '_blank', 'noopener');
      message.textContent = 'Solicitud guardada. Abrimos WhatsApp con los datos enviados.';
      form.reset();
    } catch (error) {
      message.textContent = 'No pudimos guardar tu solicitud. Intenta nuevamente en unos minutos.';
    }
  });
}

const whatsappButton = document.createElement('a');
whatsappButton.className = 'whatsapp-float';
whatsappButton.href = 'https://wa.me/51907283417?text=Hola%2C%20quisiera%20recibir%20informaci%C3%B3n%20sobre%20LUMVEA.';
whatsappButton.target = '_blank';
whatsappButton.rel = 'noopener noreferrer';
whatsappButton.setAttribute('aria-label', 'Escribir a LUMVEA por WhatsApp');
whatsappButton.innerHTML = '<span class="whatsapp-mark" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M12 3a8.5 8.5 0 0 0-7.3 12.85L3.5 20.5l4.77-1.16A8.5 8.5 0 1 0 12 3Zm0 15.5a7 7 0 0 1-3.35-.86l-.34-.18-2.83.69.73-2.75-.2-.36A7 7 0 1 1 12 18.5Zm3.84-5.22c-.21-.11-1.24-.61-1.43-.68-.19-.07-.33-.11-.47.11-.14.21-.54.68-.66.82-.12.14-.24.16-.45.05a5.72 5.72 0 0 1-1.68-1.04 6.3 6.3 0 0 1-1.16-1.45c-.12-.21-.01-.32.09-.42.09-.09.21-.24.31-.36.1-.12.14-.21.21-.35.07-.14.03-.26-.02-.37-.05-.11-.47-1.13-.64-1.55-.17-.4-.34-.35-.47-.36h-.4c-.14 0-.36.05-.55.26-.19.21-.72.7-.72 1.71s.74 1.98.84 2.12c.1.14 1.46 2.23 3.54 3.13.49.21.88.34 1.18.43.5.16.96.14 1.32.08.4-.06 1.24-.51 1.41-1 .17-.48.17-.9.12-.98-.05-.09-.19-.14-.4-.24Z" fill="currentColor" /></svg></span><span>WhatsApp</span>';
document.body.append(whatsappButton);

document.querySelectorAll('#year').forEach((year) => { year.textContent = new Date().getFullYear(); });
