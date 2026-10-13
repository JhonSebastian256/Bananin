/* ===== Datos de ejemplo (reemplazar por tu API / sensor) ===== */
const lectura = {
  r: 214, g: 190, b: 60,        // color leído (se muestra en el recuadro)
  hace: 'hace 12 s',
  etapa: 3, totalEtapas: 4, etapaNombre: 'Maduro',
  dias: 3,
  destino: 'Vender local',
  confianza: 82,
  valorCOP: null,                // p. ej. 2400
};

const historial = [
  { dia: '5/oct/2026', items: [
    { hora: '11:45 pm', rgb: 56234 },
    { hora: '3:00 pm',  rgb: 58322 },
    { hora: '10:30 am', rgb: 52334 },
  ]},
  { dia: '4/oct/2026', items: [
    { hora: '4:50 am', rgb: 55222 },
    { hora: '9:30 am', rgb: 51224 },
  ]},
];

/* ===== Utilidades ===== */
const $ = (s, r = document) => r.querySelector(s);
const fmt = n => n.toLocaleString('en-US');

// Convierte el valor numérico RGB (24 bits) a un color CSS aproximado
function rgbToCss(v) {
  const x = v % 0xFFFFFF;
  return `rgb(${(x >> 16) & 255}, ${(x >> 8) & 255}, ${x & 255})`;
}

/* ===== Navegación (hash routing) ===== */
const views = ['inicio', 'historial', 'bananin'];
let chartsReady = false;

function route() {
  const name = views.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'inicio';
  views.forEach(v => {
    $(`#view-${v}`).hidden = v !== name;
    const link = $(`[data-nav="${v}"]`);
    link.classList.toggle('active', v === name);
    link.toggleAttribute('aria-current', v === name);
  });
  if (name === 'bananin') $('#chat-input').focus();
}
window.addEventListener('hashchange', route);

/* ===== Inicio ===== */
function renderInicio() {
  $('#swatch').style.background = `rgb(${lectura.r}, ${lectura.g}, ${lectura.b})`;
  $('#kpi-lectura').textContent = `R ${lectura.r}`;
  $('#kpi-hace').textContent = lectura.hace;
  $('#kpi-etapa').textContent = `Etapa ${lectura.etapa} de ${lectura.totalEtapas}`;
  $('#kpi-etapa-nombre').textContent = lectura.etapaNombre;
  $('#kpi-dias').textContent = `≈ ${lectura.dias} días`;
  $('#kpi-destino').textContent = lectura.destino;
  $('#chip-conf').textContent = `Confianza: ${lectura.confianza} %`;
  $('#chip-valor').textContent = lectura.valorCOP
    ? `Valor estimado: $ ${fmt(lectura.valorCOP)} COP/kg`
    : 'Valor estimado: $ ___ COP/kg';

  $('#stage-bar').innerHTML = Array.from({ length: lectura.totalEtapas }, (_, i) =>
    `<span class="stage-seg ${i < lectura.etapa ? 'on' : ''}"></span>`).join('');
}

/* ===== Historial ===== */
function renderHistorial() {
  $('#lista-historial').innerHTML = historial.map(d => `
    <h3 class="day-title">Día: ${d.dia}</h3>
    ${d.items.map(i => `
      <div class="reading">
        <span class="dot" style="background:${rgbToCss(i.rgb)}"></span>
        <span>${i.hora} · RGB: <strong>${fmt(i.rgb)}</strong></span>
      </div>`).join('')}
  `).join('');
}

function buildCharts() {
  // Orden cronológico de las lecturas (de la más antigua a la más reciente)
  const pts = [...historial].reverse().flatMap(d => [...d.items].reverse().map(i => ({ x: `${d.dia.split('/')[0]}/${d.dia.split('/')[1]} ${i.hora}`, y: i.rgb })));
  const make = (id, small) => new Chart($(id), {
    type: 'line',
    data: {
      labels: pts.map(p => p.x),
      datasets: [{
        data: pts.map(p => p.y),
        borderColor: '#B8860B',
        backgroundColor: 'rgba(245, 200, 66, .25)',
        fill: true, tension: .35, pointRadius: small ? 2 : 4, pointBackgroundColor: '#F5C842',
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: !small, ticks: { maxRotation: 45, font: { size: 10 } }, grid: { display: false } },
        y: { display: !small, ticks: { font: { size: 10 } } },
      },
    },
  });
  make('#chart-mini', true);
  make('#chart-hist', false);
}

function descargarInforme() {
  const filas = [['Fecha', 'Hora', 'RGB']];
  historial.forEach(d => d.items.forEach(i => filas.push([d.dia, i.hora, i.rgb])));
  const csv = filas.map(f => f.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'informe-bananin.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ===== Chat ===== */
const log = $('#chat-log');

function addBubble(html, who) {
  const el = document.createElement('div');
  el.className = `bubble ${who}`;
  el.innerHTML = html;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

function saludo() {
  addBubble(`
    <p>¡Hola! 🍌 Soy <strong>Bananín</strong>, tu amigo de IA personal para el mundo del banano.</p>
    <p>Analizo los datos del estado de tu fruta para ayudarte a decidir qué hacer con ella: cómo transportarla, por dónde distribuirla y cuándo venderla al mejor precio, para que tomes decisiones más rentables y reduzcas pérdidas.</p>
    <p>Cuéntame, ¿en qué te puedo ayudar hoy?</p>`, 'bot');
}

// Respuesta simulada. Aquí conectas tu backend / LLM.
async function responder(texto) {
  // Ejemplo de integración real:
  // const r = await fetch('/api/chat', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ mensaje: texto }) });
  // return (await r.json()).respuesta;
  await new Promise(r => setTimeout(r, 900));
  return `Tu banano está en la etapa ${lectura.etapa} de ${lectura.totalEtapas} y le quedan unos ${lectura.dias} días de vida útil. Mi recomendación actual es: <strong>${lectura.destino.toLowerCase()}</strong>.`;
}

$('#chat-form').addEventListener('submit', async e => {
  e.preventDefault();
  const input = $('#chat-input');
  const texto = input.value.trim();
  if (!texto) return;
  input.value = '';
  addBubble(texto.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])), 'user');
  const typing = addBubble('<span class="typing"><span></span><span></span><span></span></span>', 'bot');
  try {
    typing.innerHTML = await responder(texto);
  } catch {
    typing.textContent = 'Ups, no pude responder ahora. Intenta de nuevo.';
  }
  log.scrollTop = log.scrollHeight;
});

/* ===== Arranque ===== */
renderInicio();
renderHistorial();
buildCharts();
saludo();
$('#btn-informe').addEventListener('click', descargarInforme);
route();
