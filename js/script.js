const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const state = {
  user: JSON.parse(localStorage.getItem('lc_user') || 'null'),
  history: JSON.parse(localStorage.getItem('lc_history') || '[]'),
  library: JSON.parse(localStorage.getItem('lc_library') || '[]'),
  lastResults: []
};

const corpus = [
  {
    fragmento: '«La justicia es aquello por lo cual cada uno posee lo suyo y obra lo que le corresponde.»',
    autor: 'Platón', obra: 'República', epoca: 'siglo IV a. C.', referencia: 'Libro IV, 433a-b', es_parafrasis: true,
    tradition: 'Antigüedad grecolatina', category: 'Concepto filosófico o humanístico', keywords: ['justicia','orden','ciudad','alma'],
    base: 'Sócrates busca definir la justicia comparando la ciudad con el alma. La idea central es que una comunidad funciona bien cuando sus partes cumplen su tarea sin invadir la función de las demás.',
    why: 'Platón es pertinente porque convierte una palabra abstracta en una estructura visible: ciudad, oficios y alma. El pasaje permite enseñar el concepto sin reducirlo a castigo o norma externa.',
    relation: 'El vínculo aparece en las expresiones “cada uno posee lo suyo” y “lo que le corresponde”: la justicia no se presenta solo como repartir cosas, sino como ordenar responsabilidades. Esto ayuda a analizar el tema como equilibrio entre derechos, deberes y bien común.'
  },
  {
    fragmento: '«La virtud es un hábito electivo que consiste en un término medio relativo a nosotros, determinado por la razón.»',
    autor: 'Aristóteles', obra: 'Ética a Nicómaco', epoca: 'siglo IV a. C.', referencia: 'Libro II, cap. 6, 1106b-1107a', es_parafrasis: false,
    tradition: 'Antigüedad grecolatina', category: 'Virtud ética o cívica', keywords: ['prudencia','virtud','hábito','razón','medio'],
    base: 'Aristóteles explica que una virtud no nace de un impulso aislado, sino de practicar buenas decisiones hasta formar carácter. El término medio evita tanto el exceso como el defecto.',
    why: 'Este texto es valioso porque ofrece un criterio práctico para educar virtudes: no basta saber qué es bueno, hay que ejercitarlo con razón y medida.',
    relation: 'La relación se demuestra por “hábito electivo”, que subraya la repetición consciente, y “término medio”, que permite distinguir valentía de temeridad o cobardía. Así el tema se vuelve una herramienta para decidir mejor.'
  },
  {
    fragmento: '«No basta adquirir sabiduría; es preciso también usarla.»',
    autor: 'Cicerón', obra: 'Sobre los deberes', epoca: 'siglo I a. C.', referencia: 'Libro I, idea moral recurrente sobre officium', es_parafrasis: true,
    tradition: 'Antigüedad grecolatina', category: 'Enseñanza o lección práctica', keywords: ['responsabilidad','deber','acción','vida'],
    base: 'Cicerón escribe para formar ciudadanos capaces de unir conocimiento, honor y acción pública. La sabiduría se verifica en la conducta.',
    why: 'Cicerón resulta especialmente útil para el aula porque conecta aprendizaje y ciudadanía: saber más debe mejorar nuestras decisiones y nuestras obligaciones con otros.',
    relation: 'La frase opone “adquirir” y “usar”. Esa tensión muestra que una enseñanza práctica no termina en memorizar, sino en aplicar lo aprendido a una situación concreta y responsable.'
  },
  {
    fragmento: '«Ninguna cosa grande se ha producido de repente.»',
    autor: 'Epicteto', obra: 'Disertaciones', epoca: 'siglo I-II d. C.', referencia: 'Libro I, enseñanza estoica sobre progreso moral', es_parafrasis: true,
    tradition: 'Antigüedad grecolatina', category: 'Enseñanza o lección práctica', keywords: ['paciencia','disciplina','aprendizaje','constancia'],
    base: 'La filosofía estoica insiste en entrenar el juicio y la voluntad. El progreso personal se compara con un ejercicio diario.',
    why: 'El fragmento es breve, memorable y adecuado para estudiantes porque combate la frustración inmediata y presenta la mejora como proceso.',
    relation: 'La palabra “de repente” es clave: niega la fantasía de resultados instantáneos. El pasaje enseña que la constancia transforma una meta grande en acciones pequeñas y sostenidas.'
  },
  {
    fragmento: '«Ama y haz lo que quieras.»',
    autor: 'San Agustín', obra: 'Tratados sobre la Primera Carta de Juan', epoca: 'siglo IV-V', referencia: 'Tratado VII, 8', es_parafrasis: false,
    tradition: 'Edad Media', category: 'Virtud ética o cívica', keywords: ['amor','intención','bien','voluntad'],
    base: 'Agustín enseña que la intención del amor verdadero orienta la acción hacia el bien. No invita al capricho, sino a purificar el motivo de lo que hacemos.',
    why: 'Es pertinente porque permite discutir la relación entre libertad y responsabilidad moral con una frase poderosa y debatible.',
    relation: 'El puente está en “ama”: esa palabra funciona como criterio interior. “Haz lo que quieras” solo se entiende si la voluntad ha sido formada por el amor al bien, no por el egoísmo.'
  },
  {
    fragmento: '«La experiencia, madre de todas las certidumbres, no engaña.»',
    autor: 'Leonardo da Vinci', obra: 'Cuadernos', epoca: 'siglos XV-XVI', referencia: 'Notas sobre observación y experiencia', es_parafrasis: true,
    tradition: 'Renacimiento y Siglo de Oro', category: 'Principio o idea científica', keywords: ['experiencia','observación','método','evidencia'],
    base: 'Leonardo defendió observar, dibujar y comprobar la naturaleza antes de aceptar una explicación. Su práctica une arte, técnica y ciencia.',
    why: 'Es útil porque introduce el método empírico con una imagen clara: la experiencia como fuente de corrección frente a opiniones no verificadas.',
    relation: 'La expresión “madre de todas las certidumbres” muestra que el conocimiento seguro nace de observar y probar. Para una idea científica, el texto justifica pasar de la autoridad a la evidencia.'
  },
  {
    fragmento: '«La filosofía está escrita en ese grandísimo libro que continuamente está abierto ante nuestros ojos: el universo.»',
    autor: 'Galileo Galilei', obra: 'El ensayador', epoca: 'siglo XVII', referencia: 'Cap. 6', es_parafrasis: false,
    tradition: 'Ilustración y Modernidad', category: 'Principio o idea científica', keywords: ['universo','matemática','observación','naturaleza','ciencia'],
    base: 'Galileo afirma que la naturaleza puede leerse si comprendemos su lenguaje matemático. La ciencia exige mirar el mundo y formular relaciones medibles.',
    why: 'Este pasaje es central para enseñar ciencia moderna porque resume la transición hacia observación, medición y lenguaje matemático.',
    relation: 'Las metáforas “libro” y “abierto ante nuestros ojos” conectan ciencia con lectura rigurosa de la realidad. El universo no se inventa: se interpreta con método, signos y pruebas.'
  },
  {
    fragmento: '«Pienso, luego existo.»',
    autor: 'René Descartes', obra: 'Discurso del método', epoca: 'siglo XVII', referencia: 'Parte IV', es_parafrasis: false,
    tradition: 'Ilustración y Modernidad', category: 'Concepto filosófico o humanístico', keywords: ['duda','razón','yo','conocimiento','certeza'],
    base: 'Descartes busca una verdad indudable. Al dudar de todo, descubre que el acto mismo de pensar confirma la existencia del sujeto que piensa.',
    why: 'Es una puerta de entrada excelente para explicar la modernidad filosófica: el centro del problema pasa a ser el sujeto, la razón y la certeza.',
    relation: 'El vínculo se concentra en “pienso” y “existo”. La frase muestra que una idea filosófica puede nacer de analizar una operación mental concreta: si hay pensamiento, hay alguien que piensa.'
  },
  {
    fragmento: '«Atrévete a saber.»',
    autor: 'Immanuel Kant', obra: 'Respuesta a la pregunta: ¿Qué es la Ilustración?', epoca: 'siglo XVIII', referencia: 'Inicio del ensayo, 1784', es_parafrasis: false,
    tradition: 'Ilustración y Modernidad', category: 'Enseñanza o lección práctica', keywords: ['autonomía','razón','libertad','aprendizaje'],
    base: 'Kant define la Ilustración como salida de la minoría de edad intelectual. Invita a usar la razón propia con responsabilidad.',
    why: 'Es adecuado para educación porque convierte el aprendizaje en una actitud: preguntar, argumentar y no depender pasivamente de otros.',
    relation: '“Atrévete” indica valor cívico; “saber” indica uso de la razón. Juntas, las palabras muestran que aprender exige iniciativa y responsabilidad intelectual.'
  }
];

function saveState(){
  localStorage.setItem('lc_user', JSON.stringify(state.user));
  localStorage.setItem('lc_history', JSON.stringify(state.history));
  localStorage.setItem('lc_library', JSON.stringify(state.library));
}

function toast(message){
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}

function normalize(text){ return (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }

function levelText(level, item, query){
  if(level === 'Primaria'){
    return `${item.base} En palabras sencillas, el texto ayuda a pensar en ${query} con un ejemplo cercano: lo importante es reconocer qué acción buena se puede practicar hoy.`;
  }
  if(level === 'Secundaria / Ciclo Básico'){
    return `${item.base} Para este nivel conviene ubicar al autor en su época y preguntar qué problema intenta resolver. El fragmento permite comparar la idea de ${query} con situaciones actuales del curso, la familia o la comunidad.`;
  }
  return `${item.base} En bachillerato puede leerse como una formulación conceptual: el pasaje condensa una premisa, una consecuencia y un criterio de interpretación para discutir ${query} con mayor rigor histórico y argumentativo.`;
}

function guide(level, query){
  if(level === 'Primaria') return [`Dibuja una escena donde aparezca ${query}.`, 'Explica con tus palabras qué consejo da el autor.', 'Menciona una acción pequeña para practicar esta idea en clase.'];
  if(level === 'Secundaria / Ciclo Básico') return [`Subraya dos palabras del fragmento que se relacionen con ${query}.`, 'Compara la idea del autor con un problema actual.', 'Escribe una pregunta crítica que le harías al texto.'];
  return [`Reconstruye el argumento del pasaje en premisas y conclusión.`, `Evalúa si la relación con ${query} depende del contexto histórico o sigue vigente.`, 'Propón una objeción razonada y una posible respuesta del autor.'];
}

function searchItems(query, category, level, tradition){
  const q = normalize(query);
  let items = corpus.filter(item => (tradition === 'Todas' || item.tradition === tradition));
  const preferred = items.filter(item => item.category === category || item.keywords.some(k => q.includes(normalize(k)) || normalize(k).includes(q)));
  if(preferred.length) items = preferred;
  return items.slice(0,3).map(item => ({
    ...item,
    explicacion_nivel: levelText(level, item, query),
    justificacion_seleccion: item.why,
    explicacion_relacion: item.relation,
    guia_didactica: guide(level, query),
    selectedQuery: query,
    selectedLevel: level,
    selectedCategory: category
  }));
}

function renderResults(results, query){
  const grid = $('#resultsGrid');
  $('#resultsTitle').textContent = results.length ? `Cómo enseñar “${query}”` : 'Fragmentos recomendados';
  $('#status').textContent = results.length ? `${results.length} fragmentos preparados con explicación, justificación y guía didáctica.` : 'No se encontraron coincidencias en la muestra local.';
  grid.innerHTML = results.map((r, index) => `
    <article class='result-card' data-index='${index}'>
      <div class='result-top'>
        <div>
          <blockquote class='fragment'>${r.fragmento}</blockquote>
          <div class='biblio'>
            <span>${r.autor}</span><span>${r.obra}</span><span>${r.epoca}</span><span>${r.referencia}</span><span class='badge'>${r.es_parafrasis ? 'Traducción fiel / paráfrasis transparente' : 'Cita traducida'}</span>
          </div>
        </div>
        <div class='card-actions'>
          <button class='btn btn-secondary copy-btn' data-index='${index}'>Copiar cita con análisis</button>
          <button class='btn btn-primary save-btn' data-index='${index}'>Guardar en biblioteca</button>
          <button class='btn btn-ghost print-btn' data-index='${index}'>Exportar / imprimir</button>
        </div>
      </div>
      <div class='card-body'>
        <section class='info-block'><h3>Por qué este texto</h3><p>${r.justificacion_seleccion}</p></section>
        <section class='info-block'><h3>Explicación adaptada al nivel</h3><p>${r.explicacion_nivel}</p></section>
        <section class='info-block bridge'><h3>Cómo se relaciona con ${r.selectedQuery}</h3><p>${r.explicacion_relacion}</p></section>
        <section class='info-block guide'><h3>Guía didáctica</h3><ul>${r.guia_didactica.map(q => `<li>${q}</li>`).join('')}</ul></section>
      </div>
    </article>`).join('');
}

function resultAsText(r){
  return `${r.fragmento}\n${r.autor}, ${r.obra}, ${r.epoca}, ${r.referencia}.\n\nPor qué este texto: ${r.justificacion_seleccion}\n\nCómo se relaciona: ${r.explicacion_relacion}\n\nExplicación: ${r.explicacion_nivel}\n\nGuía didáctica:\n- ${r.guia_didactica.join('\n- ')}`;
}

function renderPanels(){
  $('#loginBtn').hidden = !!state.user;
  $('#logoutBtn').hidden = !state.user;
  const library = $('#libraryList');
  if(!state.user){
    library.className = 'list empty';
    library.textContent = 'Inicia sesión y guarda fragmentos para verlos aquí.';
  } else if(!state.library.length){
    library.className = 'list empty';
    library.textContent = 'Aún no has guardado fragmentos.';
  } else {
    library.className = 'list';
    library.innerHTML = state.library.map(item => `<div class='list-item'><strong>${item.author}</strong> — ${item.work}<small>${item.reference} · ${item.category} · ${item.education_level}</small></div>`).join('');
  }
  const history = $('#historyList');
  if(!state.history.length){
    history.className = 'list empty';
    history.textContent = 'Tus búsquedas aparecerán en este panel.';
  } else {
    history.className = 'list';
    history.innerHTML = state.history.map(h => `<div class='list-item'><strong>${h.query}</strong><small>${h.category} · ${h.education_level} · ${new Date(h.created_at).toLocaleString('es')}</small></div>`).join('');
  }
}

$('#searchForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const query = $('#query').value.trim();
  const category = $('#category').value;
  const level = $('#educationLevel').value;
  const tradition = $('#tradition').value;
  const results = searchItems(query, category, level, tradition);
  state.lastResults = results;
  state.history.unshift({query, category, education_level: level, results_json: results, created_at: new Date().toISOString()});
  state.history = state.history.slice(0, 12);
  saveState();
  renderResults(results, query);
  renderPanels();
  toast('Búsqueda preparada');
});

$('#resultsGrid').addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if(!button) return;
  const index = Number(button.dataset.index);
  const result = state.lastResults[index];
  if(!result) return;
  if(button.classList.contains('copy-btn')){
    await navigator.clipboard.writeText(resultAsText(result));
    toast('Cita y análisis copiados');
  }
  if(button.classList.contains('save-btn')){
    if(!state.user){ toast('Inicia sesión para guardar'); $('#authDialog').showModal(); return; }
    state.library.unshift({
      author: result.autor,
      work: result.obra,
      reference: result.referencia,
      fragment_text: result.fragmento,
      explanation: result.explicacion_nivel,
      selection_justification: result.justificacion_seleccion,
      relation_explanation: result.explicacion_relacion,
      category: result.selectedCategory,
      education_level: result.selectedLevel,
      created_at: new Date().toISOString()
    });
    saveState(); renderPanels(); toast('Fragmento guardado');
  }
  if(button.classList.contains('print-btn')) window.print();
});

$('#authForm').addEventListener('submit', (event) => {
  event.preventDefault();
  state.user = { name: $('#authName').value || 'Usuario', email: $('#authEmail').value, role: $('#authRole').value };
  saveState(); renderPanels(); $('#authDialog').close(); toast('Sesión iniciada');
});

$('#loginBtn').addEventListener('click', () => $('#authDialog').showModal());
$('#logoutBtn').addEventListener('click', () => { state.user = null; saveState(); renderPanels(); toast('Sesión cerrada'); });
$('#clearLibraryBtn').addEventListener('click', () => { state.library = []; saveState(); renderPanels(); toast('Biblioteca vaciada'); });
$('#clearHistoryBtn').addEventListener('click', () => { state.history = []; saveState(); renderPanels(); toast('Historial limpiado'); });
$('#printAllBtn').addEventListener('click', () => window.print());
$('#sampleBtn').addEventListener('click', () => {
  $('#query').value = 'la prudencia';
  $('#category').value = 'Virtud ética o cívica';
  $('#educationLevel').value = 'Secundaria / Ciclo Básico';
  $('#tradition').value = 'Todas';
  $('#searchForm').dispatchEvent(new Event('submit'));
  location.hash = '#buscar';
});
$('#navToggle').addEventListener('click', () => {
  const links = $('#navLinks');
  const open = links.classList.toggle('open');
  $('#navToggle').setAttribute('aria-expanded', String(open));
});

renderPanels();
