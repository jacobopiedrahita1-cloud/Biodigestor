/* ==========================================================
   BIODIGESTOR · De residuos a energía — Lógica de la presentación
   Sin dependencias: todo (datos, gráficas, ilustraciones y juego)
   vive en este archivo y funciona sin conexión.
   ========================================================== */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = n => String(n).replace('.', ',');           // 25.1 -> "25,1"
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;   // aleatorio repetible (solo decorativo)

/* ----------------------------------------------------------
   1. DATOS DEL ARTÍCULO (únicos valores científicos de la web)
   ---------------------------------------------------------- */
const DATA = {
  dias: 40, primerMetano: 9, diaMax: 14,
  maxDiario: 200,          // mL, día 14
  total: 802,              // mL acumulados al día 40
  promFase: 25.1,          // mL/día = 802 / 32 (días 9 a 40)
  promTotal: 20.1,         // mL/día = 802 / 40
  porcMax: 24.9,           // % = 200 / 802
  resto: 602,              // mL = 802 - 200
  restoDias: 31,           // días restantes de la fase productiva (32 - 1)
  restoProm: 19.4          // mL/día = 602 / 31
};

const TL = [
  { d: 1,  name: 'Carga',               kind: 'zero',  chip: 'Sin metano',
    obs: 'Se colocaron residuos de frutas y verduras en el biodigestor.', prod: 'No se produjo metano.' },
  { d: 7,  name: 'Fin de la adaptación', kind: 'low',   chip: 'Gas todavía bajo',
    obs: 'Terminó el período inicial de adaptación del biodigestor.', prod: 'La producción de gas todavía era baja.' },
  { d: 9,  name: 'Primer metano',       kind: 'first', chip: 'Primera detección',
    obs: 'Comenzó a producirse metano.', prod: 'Se empezó a detectar metano.' },
  { d: 14, name: 'Máximo diario',       kind: 'bar', bar: 200, chip: '200 mL en el día',
    obs: 'Se presentó la mayor producción diaria registrada.', prod: '200 mL de metano en el día.' },
  { d: 30, name: 'Controles',           kind: 'ctl',   chip: 'Producción continua',
    obs: 'El proceso continuó y se realizaron controles de pH y temperatura.', prod: 'Continuó la producción de gas.' },
  { d: 40, name: 'Cierre',              kind: 'bar', bar: 802, chip: '802 mL acumulados',
    obs: 'Terminó el tiempo de funcionamiento del biodigestor.', prod: 'Producción total: 0,802 L (802 mL) de metano.' }
];

/* ----------------------------------------------------------
   2. BIODI · el robot ecológico (SVG propio)
   ---------------------------------------------------------- */
function biodi(mood = 'happy') {
  const eye = (cx, dx, dy, r) => `<g class="blink"><ellipse cx="${cx}" cy="42" rx="${r}" ry="${r + 1}" fill="#ffd23f"/><circle cx="${cx + 1 + dx}" cy="${43 + dy}" r="3.8" fill="#0f2236"/><circle cx="${cx - 2 + dx}" cy="${39 + dy}" r="1.6" fill="#fff"/></g>`;
  const brow = d => `<path d="${d}" stroke="#ffd23f" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const face = {
    happy: `<path d="M37 45Q46 33 55 45M65 45Q74 33 83 45" stroke="#ffd23f" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M51 53Q60 61 69 53" stroke="#ffd23f" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
    think: eye(46, 2, -2, 8.5) + eye(74, 2, -2, 8.5) + brow('M36 30L54 32') + brow('M66 27L84 25') + `<path d="M54 56H65" stroke="#ffd23f" stroke-width="3.5" stroke-linecap="round"/>`,
    oops:  eye(46, 0, 1, 8.5) + eye(74, 0, 1, 8.5) + brow('M36 34L54 29') + brow('M84 34L66 29') + `<path d="M52 58Q60 52 68 58" stroke="#ffd23f" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
    wow:   eye(46, 0, 0, 10) + eye(74, 0, 0, 10) + `<ellipse cx="60" cy="57" rx="4" ry="3.2" fill="#ffd23f"/>`
  }[mood] || '';
  const arms = mood === 'happy'
    ? `<g class="wave"><path d="M90 90Q106 84 108 66" stroke="#145a40" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="108" cy="63" r="5.5" fill="#ffd23f" stroke="#0e3b2c" stroke-width="2"/></g><path d="M30 90Q16 96 14 112" stroke="#145a40" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="14" cy="115" r="5.5" fill="#ffd23f" stroke="#0e3b2c" stroke-width="2"/>`
    : `<path d="M30 90Q16 96 14 112" stroke="#145a40" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="14" cy="115" r="5.5" fill="#ffd23f" stroke="#0e3b2c" stroke-width="2"/><path d="M90 90Q104 96 106 112" stroke="#145a40" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="106" cy="115" r="5.5" fill="#ffd23f" stroke="#0e3b2c" stroke-width="2"/>`;
  const recycle = [0, 120, 240].map(a => `<g transform="rotate(${a} 60 104)"><path d="M60 95A9 9 0 0 1 67.8 99.5" stroke="#1f8a5b" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="M64.6 95.6L70.4 100.6L63.6 102Z" fill="#1f8a5b"/></g>`).join('');
  return `<svg viewBox="0 0 120 150" aria-hidden="true" focusable="false"><ellipse cx="60" cy="146" rx="32" ry="3.2" fill="rgba(16,37,28,.18)"/><g class="float">
    <path d="M60 20V9" stroke="#14283f" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="7" r="3.4" fill="#ffd23f" stroke="#14283f" stroke-width="1.5"/>
    <path d="M62 13C64 3 78 0 85 5C83 15 71 19 62 13Z" fill="#3fae6a" stroke="#145a40" stroke-width="2" stroke-linejoin="round"/><path d="M64 13Q73 9 82 6" stroke="#145a40" stroke-width="1.4" fill="none"/>
    ${arms}
    <path d="M32 78H88L84 126Q84 130 80 130H40Q36 130 36 126Z" fill="#1f8a5b" stroke="#0e3b2c" stroke-width="3" stroke-linejoin="round"/>
    <rect x="27" y="72" width="66" height="11" rx="5.5" fill="#2fb57a" stroke="#0e3b2c" stroke-width="3"/>
    <path d="M45 87V124M75 87V124" stroke="#145a40" stroke-width="2" opacity=".45"/>
    <circle cx="60" cy="104" r="15" fill="#fff6d6" stroke="#0e3b2c" stroke-width="2.5"/>${recycle}
    <rect x="52" y="62" width="16" height="12" fill="#14283f"/>
    <rect x="20" y="18" width="80" height="48" rx="20" fill="#1d4268" stroke="#0b1f33" stroke-width="3"/>
    <circle cx="17" cy="42" r="4.5" fill="#ffd23f" stroke="#0b1f33" stroke-width="2"/><circle cx="103" cy="42" r="4.5" fill="#ffd23f" stroke="#0b1f33" stroke-width="2"/>
    <rect x="26" y="24" width="68" height="38" rx="15" fill="#0f2236"/>
    ${face || eye(46, 0, 0, 8.5) + eye(74, 0, 0, 8.5) + '<path d="M52 55Q60 60 68 55" stroke="#ffd23f" stroke-width="3.5" fill="none" stroke-linecap="round"/>'}
    <rect x="34" y="128" width="52" height="7" rx="3.5" fill="#14283f"/>
    <circle cx="46" cy="137" r="8.5" fill="#14283f"/><circle cx="46" cy="137" r="3.2" fill="#ffd23f"/>
    <circle cx="74" cy="137" r="8.5" fill="#14283f"/><circle cx="74" cy="137" r="3.2" fill="#ffd23f"/>
  </g></svg>`;
}
const setBiodi = (el, mood) => { if (el) el.innerHTML = biodi(mood); };

/* ----------------------------------------------------------
   3. ILUSTRACIÓN DEL BIODIGESTOR (SVG propio, 4 variantes)
      cover · explore · plain · concept
   ---------------------------------------------------------- */
function digesterSVG(mode, uid) {
  const explore = mode === 'explore', cover = mode === 'cover', concept = mode === 'concept';
  const anim = !reduced;
  const R = rng(11);
  let bubbles = '', specks = '', sludge = '', motes = '';
  for (let i = 0; i < 16; i++) {
    const x = 162 + R() * 216, y = 275 + R() * 165, r = 3 + R() * 5, dur = 3.4 + R() * 3.2, del = -R() * 6;
    const st = anim ? `--dy:${(-(y - 192)).toFixed(0)}px;animation-duration:${dur.toFixed(1)}s;animation-delay:${del.toFixed(1)}s` : 'animation:none;opacity:.85';
    bubbles += `<circle class="bub" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" style="${st}"/>`;
  }
  const cols = ['#6f9a2e', '#d9483b', '#f6d34a', '#a04a14', '#8cbf4a', '#f28a1e'];
  for (let i = 0; i < 48; i++) {
    specks += `<ellipse cx="${(156 + R() * 232).toFixed(1)}" cy="${(258 + R() * 120).toFixed(1)}" rx="${(2.5 + R() * 4).toFixed(1)}" ry="${(1.8 + R() * 2.4).toFixed(1)}" transform="rotate(${(R() * 180).toFixed(0)} 270 320)" fill="${cols[Math.floor(R() * cols.length)]}" opacity=".85"/>`;
  }
  for (let i = 0; i < 22; i++) {
    sludge += `<ellipse cx="${(156 + R() * 232).toFixed(1)}" cy="${(394 + R() * 52).toFixed(1)}" rx="${(2 + R() * 4).toFixed(1)}" ry="${(1.5 + R() * 2).toFixed(1)}" fill="${R() > .5 ? '#4a2610' : '#8a4b1f'}" opacity=".8"/>`;
  }
  if (cover && anim) {
    for (let i = 0; i < 12; i++) {
      motes += `<circle class="mote" cx="${(30 + R() * 580).toFixed(0)}" cy="${(220 + R() * 260).toFixed(0)}" r="${(2 + R() * 3).toFixed(1)}" style="animation-delay:${(-R() * 7).toFixed(1)}s;animation-duration:${(5 + R() * 4).toFixed(1)}s"/>`;
    }
  }
  const pipeD = 'M270 120V92Q270 80 282 80H440';
  const pill = (x, y, w, t) => `<g><rect x="${x - w / 2}" y="${y - 12}" width="${w}" height="24" rx="12" fill="#fffaf0" stroke="rgba(20,40,63,.4)" stroke-width="1.5"/><text x="${x}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-size="12.5" fill="#14283f">${t}</text></g>`;
  const hot = (n, x, y, label) => `<g class="hot" data-part="${n}" role="button" tabindex="0" aria-label="${n}. ${label}"><circle cx="${x}" cy="${y}" r="14"/><text x="${x}" y="${y}">${n}</text></g>`;

  const chute = `<g class="f-digester-x">
    <path d="M46 80L112 66L146 134L122 140Z" fill="#4a5963" stroke="#14283f" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="68" cy="72" r="7" fill="#d9483b" stroke="#14283f" stroke-width="2"/><circle cx="88" cy="67" r="6.5" fill="#f28a1e" stroke="#14283f" stroke-width="2"/><circle cx="102" cy="73" r="6" fill="#4caf50" stroke="#14283f" stroke-width="2"/><path d="M76 62q6-7 14-2-3 8-12 8z" fill="#f6d34a" stroke="#14283f" stroke-width="2"/>
    ${cover && anim ? `<circle r="5" fill="#d9483b" stroke="#14283f" stroke-width="1.5"><animateMotion dur="3.4s" repeatCount="indefinite" path="M74 70L132 130"/><animate attributeName="opacity" values="0;1;1;0" dur="3.4s" repeatCount="indefinite"/></circle><circle r="5" fill="#f6d34a" stroke="#14283f" stroke-width="1.5"><animateMotion dur="3.4s" begin="-1.7s" repeatCount="indefinite" path="M90 66L136 128"/><animate attributeName="opacity" values="0;1;1;0" dur="3.4s" begin="-1.7s" repeatCount="indefinite"/></circle>` : ''}
  </g>`;

  const gasParticles = (cover && anim)
    ? [0, -1.3, -2.6].map(b => `<circle r="5" fill="#fff6c4" stroke="#f6b800" stroke-width="1.5"><animateMotion dur="4s" begin="${b}s" repeatCount="indefinite" path="${pipeD}"/></circle>`).join('') : '';
  const sludgeDrops = (cover && anim)
    ? [0, -1.5].map(b => `<circle r="4.5" fill="#8a4b1f" stroke="#4a2610" stroke-width="1.5"><animateMotion dur="3s" begin="${b}s" repeatCount="indefinite" path="M400 420H452V470"/></circle>`).join('') : '';

  let svg = `<svg class="dig" viewBox="0 0 640 520" ${concept ? 'data-focus="digester"' : ''} focusable="false">
  <defs><clipPath id="${uid}-clip"><rect x="146" y="166" width="248" height="292" rx="16"/></clipPath></defs>
  <ellipse cx="270" cy="505" rx="205" ry="12" fill="rgba(16,37,28,.14)"/>
  ${motes}
  <g class="fz f-digester">
    <path d="M400 420H452V474" fill="none" stroke="#14283f" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M400 420H452V474" fill="none" stroke="#6b7680" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="150" y="464" width="58" height="38" rx="3" fill="#bdbbb2" stroke="#14283f" stroke-width="3"/><rect x="332" y="464" width="58" height="38" rx="3" fill="#bdbbb2" stroke="#14283f" stroke-width="3"/>
    <rect x="136" y="156" width="268" height="312" rx="24" fill="#e6eee8" stroke="#14283f" stroke-width="4"/>
    <g clip-path="url(#${uid}-clip)">
      <rect x="146" y="166" width="248" height="92" fill="#fde39a"/>
      <path d="M146 250Q175 242 205 250T265 250T325 250T394 250V394H146Z" fill="#d9741f"/>
      <path d="M146 386Q175 380 205 386T265 386T325 386T394 386V460H146Z" fill="#6a3a1b"/>
      <g class="${anim ? 'drift' : ''}">${specks}${sludge}</g>
      ${bubbles}
      <rect x="156" y="174" width="9" height="270" rx="4.5" fill="rgba(255,255,255,.35)"/>
    </g>
    ${explore ? pill(270, 208, 74, 'Biogás') + pill(266, 318, 168, 'Materia en descomposición') + pill(270, 424, 116, 'Lodo digestato') : ''}
    <rect x="126" y="138" width="288" height="30" rx="15" fill="#2e9e46" stroke="#14283f" stroke-width="4"/>
    <path d="M146 147H300" stroke="rgba(255,255,255,.4)" stroke-width="4" stroke-linecap="round"/>
    <rect x="252" y="118" width="36" height="24" rx="6" fill="#23803a" stroke="#14283f" stroke-width="4"/>
    ${chute}
    <path d="M426 468H600L588 512H438Z" fill="#2d343b" stroke="#14283f" stroke-width="4" stroke-linejoin="round"/>
    <ellipse cx="513" cy="473" rx="80" ry="8" fill="#8a4b1f"/><ellipse cx="490" cy="471" rx="14" ry="3.5" fill="#a9622b"/><ellipse cx="540" cy="475" rx="18" ry="3.5" fill="#6a3a1b"/>
    ${sludgeDrops}
  </g>
  <g class="fz f-pipe">
    <path d="${pipeD}" fill="none" stroke="#14283f" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${pipeD}" fill="none" stroke="#f6b800" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    ${(cover || explore) && anim ? `<path class="flow" d="${pipeD}" fill="none" stroke="#fff6c4" stroke-width="3.5" stroke-linecap="round"/>` : ''}
    ${gasParticles}
    <g class="${(cover || explore) && anim ? 'breathe' : ''}">
      <ellipse cx="520" cy="105" rx="100" ry="52" fill="#2a3036" stroke="#14283f" stroke-width="4"/>
      <path d="M452 92Q480 66 520 62M468 128Q500 148 548 148" stroke="rgba(255,255,255,.16)" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M560 78Q580 90 584 108" stroke="rgba(255,255,255,.12)" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
    ${explore ? `<text x="520" y="108" text-anchor="middle" dominant-baseline="central" font-size="13" fill="#fff">Depósito de biogás</text>` : ''}
  </g>`;

  if (concept) {
    let blades = '';
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; blades += `<path d="M504 276L${(504 + 29 * Math.cos(a)).toFixed(1)} ${(276 + 29 * Math.sin(a)).toFixed(1)}" stroke="#24527c" stroke-width="5" stroke-linecap="round"/>`; }
    svg += `<g class="fz f-turbine">
      <path d="M520 160V222" stroke="#24527c" stroke-width="5" stroke-dasharray="2 11" stroke-linecap="round" fill="none"/>
      <rect x="452" y="224" width="104" height="104" rx="10" fill="rgba(219,232,244,.7)" stroke="#24527c" stroke-width="4" stroke-dasharray="9 7"/>
      <circle cx="504" cy="276" r="35" fill="rgba(255,255,255,.75)" stroke="#24527c" stroke-width="3.5" stroke-dasharray="7 6"/>${blades}<circle cx="504" cy="276" r="5" fill="#24527c"/>
      <rect x="556" y="250" width="44" height="54" rx="9" fill="rgba(60,70,80,.3)" stroke="#24527c" stroke-width="4" stroke-dasharray="9 7"/>
      <text x="526" y="352" text-anchor="middle" font-size="13" fill="#14283f">Turbina: propuesta conceptual</text>
      <text x="526" y="369" text-anchor="middle" font-size="12" fill="#24527c">(no construida ni probada)</text>
    </g>`;
  }

  if (explore) {
    svg += `
    <g class="hl" data-part="1"><path d="M36 82L110 54L158 134L118 152Z"/></g>
    <g class="hl" data-part="2"><rect x="118" y="112" width="304" height="372" rx="30"/></g>
    <g class="hl" data-part="3"><rect x="150" y="254" width="240" height="198" rx="12"/></g>
    <g class="hl" data-part="4"><rect x="150" y="170" width="240" height="80" rx="10"/></g>
    <g class="hl" data-part="5"><path class="glow" d="${pipeD}" fill="none"/></g>
    <g class="hl" data-part="6"><ellipse cx="520" cy="105" rx="114" ry="64"/></g>
    <g class="hl" data-part="7"><rect x="386" y="402" width="88" height="76"/><rect x="418" y="456" width="192" height="64" rx="8"/></g>
    ${hot(1, 36, 106, 'Entrada de residuos orgánicos')}${hot(2, 124, 300, 'Recipiente o reactor')}${hot(3, 378, 318, 'Mezcla en descomposición')}
    ${hot(4, 372, 208, 'Zona de acumulación del biogás')}${hot(5, 346, 52, 'Conducto de salida del gas')}${hot(6, 590, 62, 'Sistema de almacenamiento')}${hot(7, 612, 446, 'Salida del digestato')}`;
  }
  return svg + '</svg>';
}
function mountArt() {
  $$('[data-art]').forEach((el, i) => { el.innerHTML = digesterSVG(el.dataset.art, 'd' + i); });
  $$('[data-biodi]').forEach(el => { el.innerHTML = biodi(el.dataset.biodi); });
}

/* ----------------------------------------------------------
   4. SONIDO (opcional, generado con Web Audio; sin archivos)
   ---------------------------------------------------------- */
let actx = null, soundOn = false;
function tone(f, d = .12, type = 'sine', v = .06, delay = 0) {
  if (!soundOn) return;
  try {
    if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; actx = new C(); }
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime + delay, o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .015); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + .03);
  } catch (e) { /* el audio es opcional */ }
}
const sfx = {
  nav: () => tone(520, .08, 'triangle', .04),
  pick: () => tone(660, .07, 'sine', .05),
  ok: () => { tone(660, .1, 'triangle', .07); tone(880, .16, 'triangle', .07, .09); },
  no: () => { tone(300, .18, 'sine', .06); tone(260, .22, 'sine', .05, .1); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .2, 'triangle', .07, i * .11))
};
function toggleSound() {
  soundOn = !soundOn;
  $('#btnSound').setAttribute('aria-pressed', soundOn);
  $('#useSound').setAttribute('href', soundOn ? '#i-sound' : '#i-mute');
  $('#lblSound').textContent = soundOn ? 'Sonido: sí' : 'Sonido: no';
  toast(soundOn ? 'Sonido activado' : 'Sonido desactivado');
  sfx.pick();
}
let toastT = null;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1900); }

/* ----------------------------------------------------------
   5. NAVEGACIÓN ENTRE ESCENAS
   ---------------------------------------------------------- */
const scenes = $$('.scene');
const N = scenes.length;
let cur = -1;
const seen = new Set();
const hooks = { enter: {}, leave: {} };

function buildDots() {
  const wrap = $('#dots');
  scenes.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'dot'; b.type = 'button';
    b.title = `${i + 1}. ${s.dataset.title}`;
    b.setAttribute('aria-label', `Ir a la escena ${i + 1}: ${s.dataset.title}`);
    b.addEventListener('click', () => { goTo(i); });
    wrap.appendChild(b);
  });
}
function goTo(i, silent) {
  i = Math.max(0, Math.min(N - 1, i));
  if (i === cur) return;
  const prev = cur; cur = i; seen.add(i);
  scenes.forEach((s, k) => {
    s.dataset.state = k === i ? 'active' : (k < i ? 'before' : 'after');
    if (k === i) { s.removeAttribute('inert'); s.removeAttribute('aria-hidden'); }
    else { s.setAttribute('inert', ''); s.setAttribute('aria-hidden', 'true'); }
  });
  scenes[i].scrollTop = 0; $('#stage').scrollLeft = 0;
  if (prev >= 0 && hooks.leave[prev]) hooks.leave[prev]();
  if (hooks.enter[i]) hooks.enter[i]();
  $$('.dot').forEach((d, k) => { d.classList.toggle('on', k === i); d.classList.toggle('seen', k !== i && seen.has(k)); if (k === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
  $('#pCount').textContent = `${i + 1} / ${N}`;
  $('#pName').textContent = scenes[i].dataset.title;
  $('#crumb').innerHTML = `<em>${String(i + 1).padStart(2, '0')}</em>${scenes[i].dataset.title}`;
  $('#btnPrev').disabled = i === 0;
  $('#btnNext').disabled = i === N - 1;
  try { history.replaceState(null, '', '#escena-' + (i + 1)); } catch (e) { /* file:// en algunos navegadores */ }
  if (!silent && prev >= 0) sfx.nav();
}
const next = () => goTo(cur + 1);
const prevScene = () => goTo(cur - 1);

document.addEventListener('click', e => {
  const t = e.target.closest('[data-go]');
  if (t) { const g = t.dataset.go; if (g === 'next') next(); else if (g === 'prev') prevScene(); else if (g === 'home') goTo(0); else goTo(+g); return; }
  const a = e.target.closest('[data-action="expo"]');
  if (a) setExpo(true);
});

/* Teclado: flechas cambian de escena, salvo en controles que las usan (data-keys="local") */
document.addEventListener('keydown', e => {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.matches && e.target.matches('input,textarea,select,[contenteditable]')) return;
  switch (e.key) {
    case 'ArrowRight': case 'PageDown': e.preventDefault(); next(); break;
    case 'ArrowLeft': case 'PageUp': e.preventDefault(); prevScene(); break;
    case 'Home': e.preventDefault(); goTo(0); break;
    case 'End': e.preventDefault(); goTo(N - 1); break;
    case 'e': case 'E': setExpo(!expo); break;
    case 'f': case 'F': toggleFs(); break;
    case 'm': case 'M': toggleSound(); break;
    case 'Escape': if (expo) setExpo(false); break;
  }
});
/* Gesto de deslizar en pantallas táctiles */
(() => {
  let x0 = null, y0 = null;
  const st = $('#stage');
  st.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  st.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) { dx < 0 ? next() : prevScene(); }
  }, { passive: true });
})();

/* Flechas locales (línea de tiempo, etapas, pestañas): al llegar al extremo, pasan a la escena siguiente/anterior */
function rovingKeys(container, itemSel, select) {
  container.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const items = $$(itemSel, container), i = items.indexOf(document.activeElement);
    if (i < 0) return;
    const j = i + (e.key === 'ArrowRight' ? 1 : -1);
    if (j < 0 || j >= items.length) return;
    e.preventDefault();
    select(j, true);
  });
}

/* ----------------------------------------------------------
   6. PANTALLA COMPLETA Y MODO EXPOSICIÓN
   ---------------------------------------------------------- */
let expo = false, expoFs = false;
const fsEl = document.documentElement;
const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
async function enterFs() {
  try { const f = fsEl.requestFullscreen || fsEl.webkitRequestFullscreen; if (!f) return false; await f.call(fsEl); return true; } catch (e) { return false; }
}
function exitFs() { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { /* nada */ } }
function toggleFs() { if (isFs()) exitFs(); else enterFs(); }
function updateFsUi() {
  const on = isFs();
  $('#btnFs').setAttribute('aria-pressed', on);
  $('#useFs').setAttribute('href', on ? '#i-shrink' : '#i-expand');
  $('#fsBanner').classList.toggle('show', expo && !on && !bannerDismissed);
}
let bannerDismissed = false;
async function setExpo(on) {
  expo = on; bannerDismissed = false;
  document.documentElement.classList.toggle('expo', on);
  $('#btnExpo').setAttribute('aria-pressed', on);
  $('#lblExpo').textContent = on ? 'Salir de exposición' : 'Exposición';
  if (on) { expoFs = await enterFs(); }
  else if (expoFs && isFs()) { exitFs(); expoFs = false; }
  updateFsUi();
  toast(on ? 'Modo exposición · Esc para salir' : 'Modo exposición desactivado');
}
['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, () => {
  if (!isFs() && expo && expoFs) { expoFs = false; setExpo(false); return; }
  updateFsUi();
}));
$('#btnExpo').addEventListener('click', () => setExpo(!expo));
$('#btnFs').addEventListener('click', toggleFs);
$('#btnSound').addEventListener('click', toggleSound);
$('#btnFsBanner').addEventListener('click', async () => { expoFs = await enterFs(); updateFsUi(); });
$('#btnFsClose').addEventListener('click', () => { bannerDismissed = true; updateFsUi(); });

/* ----------------------------------------------------------
   7. ESCENA 2 · revelar la posibilidad
   ---------------------------------------------------------- */
$('#btnReveal').addEventListener('click', () => { $('#possible').classList.add('open'); sfx.ok(); });
hooks.leave[1] = () => $('#possible').classList.remove('open');

/* ----------------------------------------------------------
   8. ESCENA 3 · partes del biodigestor
   ---------------------------------------------------------- */
const PARTS = [
  { s: 'Entrada de residuos', t: 'Entrada de residuos orgánicos', d: 'Por aquí entran los restos de frutas y verduras, mezclados con agua. En el experimento, la carga se hizo el día 1.' },
  { s: 'Recipiente o reactor', t: 'Recipiente o reactor', d: 'Es el recipiente cerrado donde ocurre la digestión. Debe mantenerse sin oxígeno para que trabajen los microorganismos anaerobios.' },
  { s: 'Mezcla en descomposición', t: 'Mezcla en descomposición', d: 'Residuos, agua y microorganismos. Aquí se dan las cuatro etapas de la digestión anaerobia: hidrólisis, acidogénesis, acetogénesis y metanogénesis.' },
  { s: 'Zona de acumulación del biogás', t: 'Zona de acumulación del biogás', d: 'El gas que se produce sube y se acumula arriba. Su componente principal es el metano (según la literatura, entre el 55 % y el 70 %). En este estudio no se midió la composición del gas.' },
  { s: 'Conducto de salida del gas', t: 'Conducto de salida del gas', d: 'Un tubo lleva el gas desde la parte superior del reactor hacia el sistema de almacenamiento.' },
  { s: 'Sistema de almacenamiento', t: 'Sistema de almacenamiento', d: 'Recoge y guarda el biogás hasta que pueda aprovecharse. En la ilustración se representa como una bolsa.' },
  { s: 'Salida del digestato', t: 'Salida del digestato', d: 'Por aquí sale el lodo que queda después de la digestión, llamado digestato. Con un manejo adecuado, podría usarse como abono.' }
];
function selectPart(n) {
  $$('#parts .part-btn').forEach((b, i) => b.setAttribute('aria-pressed', i + 1 === n));
  $$('#escena-3 .hl').forEach(g => g.classList.toggle('on', +g.dataset.part === n));
  $$('#escena-3 .hot').forEach(g => g.classList.toggle('sel', +g.dataset.part === n));
  const p = PARTS[n - 1];
  $('#partInfo').innerHTML = p
    ? `<div class="say"><span class="biodi" data-biodi="happy"></span><div><h4>${n}. ${p.t}</h4><p>${p.d}</p></div></div>`
    : `<div class="say"><span class="biodi" data-biodi="wow"></span><div><p>¡Toca un número de la ilustración o un botón de la lista y te cuento qué hace esa parte!</p></div></div>`;
  $$('#partInfo [data-biodi]').forEach(el => setBiodi(el, el.dataset.biodi));
  if (n) sfx.pick();
}
function initParts() {
  $('#parts').innerHTML = PARTS.map((p, i) => `<button class="part-btn" type="button" aria-pressed="false" data-n="${i + 1}"><span class="n">${i + 1}</span>${p.s}</button>`).join('');
  $('#parts').addEventListener('click', e => { const b = e.target.closest('.part-btn'); if (b) selectPart(+b.dataset.n); });
  const svg = $('#escena-3 svg.dig');
  svg.addEventListener('click', e => { const h = e.target.closest('.hot'); if (h) selectPart(+h.dataset.part); });
  svg.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.hot')) { e.preventDefault(); selectPart(+e.target.closest('.hot').dataset.part); } });
  selectPart(0);
}

/* ----------------------------------------------------------
   9. ESCENA 4 · etapas de la digestión anaerobia
   ---------------------------------------------------------- */
const STAGES = [
  { n: 'Hidrólisis', s: 'Complejos → solubles', d: 'Los compuestos orgánicos complejos de los residuos se descomponen en sustancias solubles.' },
  { n: 'Acidogénesis', s: 'Se forman ácidos', d: 'Esas sustancias se transforman y se forman ácidos orgánicos.' },
  { n: 'Acetogénesis', s: 'Acetato, H₂ y CO₂', d: 'Los ácidos orgánicos se convierten en acetato, hidrógeno y dióxido de carbono.' },
  { n: 'Metanogénesis', s: 'Aparece el metano', d: 'Las bacterias metanogénicas producen metano. Es la última etapa del proceso.' }
];
let stageSel = 0, seqTimer = null;
function selectStage(i, focus) {
  stageSel = i;
  const tabs = $$('#stageTabs .stage-tab');
  tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
  if (focus) tabs[i].focus();
  $$('#stageSvg .stg').forEach(g => g.classList.remove('on'));
  void $('#stageSvg').getBoundingClientRect();                         // reinicia las animaciones
  $$('#stageSvg .stg')[i].classList.add('on');
  const s = STAGES[i];
  $('#stageText').innerHTML = `<p class="eyebrow">Etapa ${i + 1} de 4</p><h3>${s.n}</h3><p class="what">${s.d}</p>`;
  $('#whyBox').style.outline = i === 3 ? '3px solid var(--amber)' : 'none';
  if (!seqTimer) sfx.pick();
}
function stopSeq() {
  clearInterval(seqTimer); seqTimer = null;
  $('#useSeq').setAttribute('href', '#i-play'); $('#lblSeq').textContent = 'Ver las 4 etapas en secuencia';
}
function toggleSeq() {
  if (seqTimer) { stopSeq(); return; }
  $('#useSeq').setAttribute('href', '#i-pause'); $('#lblSeq').textContent = 'Detener secuencia';
  selectStage(0);
  seqTimer = setInterval(() => { if (stageSel >= 3) { stopSeq(); return; } selectStage(stageSel + 1); }, 4200);
}
function initStages() {
  $('#stageTabs').innerHTML = STAGES.map((s, i) => `<button class="stage-tab" type="button" role="tab" aria-selected="false" tabindex="-1"><span class="num">${i + 1}</span><span><b>${s.n}</b><small>${s.s}</small></span></button>`).join('');
  $$('#stageTabs .stage-tab').forEach((t, i) => t.addEventListener('click', () => { stopSeq(); selectStage(i); }));
  rovingKeys($('#stageTabs'), '.stage-tab', (j, f) => { stopSeq(); selectStage(j, f); });
  $('#btnSeq').addEventListener('click', toggleSeq);
  selectStage(0);
}
hooks.enter[3] = () => selectStage(stageSel);
hooks.leave[3] = stopSeq;

/* ----------------------------------------------------------
   10. ESCENA 5 · metodología
   ---------------------------------------------------------- */
const PHASES = [
  'Residuos de frutas y verduras mezclados con agua en el recipiente. El informe no consigna las cantidades.',
  'Una vez cargados los residuos, se buscó retirar la mayor cantidad posible de oxígeno para favorecer el crecimiento de los microorganismos y la producción de gases.',
  'Durante 40 días se registraron observaciones y producción de gas (días 1, 7, 9, 14, 30 y 40) y se hicieron controles de pH y temperatura, entre ellos el del día 30, para mantener el sistema estable.'
];
function selectPhase(i) {
  $$('#phases .phase').forEach((b, k) => b.setAttribute('aria-pressed', k === i));
  $('#phaseDetail').innerHTML = `<span class="chip amber">Fase ${i + 1}</span><p>${PHASES[i]}</p>`;
  sfx.pick();
}
function initPhases() {
  $$('#phases .phase').forEach((b, i) => b.addEventListener('click', () => selectPhase(i)));
  selectPhase(0);
}

/* ----------------------------------------------------------
   11. ESCENA 6 · línea de tiempo interactiva
   ---------------------------------------------------------- */
let tlSel = 0, tlRaf = null, tlPlaying = false;
function flask(kind) {
  const bub = { zero: '', low: '<circle cx="36" cy="64" r="3" /><circle cx="46" cy="56" r="2.2" />', first: '<circle cx="34" cy="68" r="3.2"/><circle cx="46" cy="60" r="2.6"/><circle cx="40" cy="48" r="2.2"/>', ctl: '<circle cx="30" cy="68" r="3"/><circle cx="42" cy="62" r="2.6"/><circle cx="50" cy="70" r="2.8"/><circle cx="38" cy="52" r="2.2"/>' }[kind] || '';
  const extra = kind === 'first' ? '<path d="M66 18l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#f2a900" stroke="#a87200" stroke-width="1.5" stroke-linejoin="round"/>'
    : kind === 'ctl' ? '<rect x="68" y="30" width="7" height="34" rx="3.5" fill="#fffdf8" stroke="#14283f" stroke-width="2.5"/><circle cx="71.5" cy="68" r="7" fill="#d9483b" stroke="#14283f" stroke-width="2.5"/><rect x="70" y="42" width="3" height="24" fill="#d9483b"/>' : '';
  return `<svg viewBox="0 0 90 100" aria-hidden="true"><path d="M30 8H50V36L68 82Q71 92 62 92H18Q9 92 12 82L30 36Z" fill="#fffdf8" stroke="#14283f" stroke-width="3" stroke-linejoin="round"/>${kind !== 'zero' ? '<path d="M20 70H60L66 84Q68 89 62 89H18Q12 89 14 84Z" fill="#d9741f" opacity=".85"/>' : ''}<g fill="#fff6c4" stroke="#14283f" stroke-width="1.2">${bub}</g><rect x="27" y="4" width="26" height="7" rx="3" fill="#0e3b2c"/>${extra}</svg>`;
}
function renderTlDetail() {
  const it = TL[tlSel];
  let ind;
  if (it.bar) {
    ind = `<div class="scale"><div>${it.bar === 200 ? 'Máximo de un solo día' : 'Acumulado al día 40'}</div><div class="scalebar"><i class="${it.bar === 802 ? 'cum' : ''}" style="width:0" data-w="${(it.bar / DATA.total * 100).toFixed(1)}%"></i></div><div>Escala común: 0 – 802 mL</div></div><span class="chip ${it.bar === 802 ? '' : 'amber'}">${it.chip}</span>`;
  } else {
    ind = `${flask(it.kind)}<span class="chip ${it.kind === 'zero' ? 'grey' : 'navy'}">${it.chip}</span>`;
  }
  const nomed = (!it.bar && it.kind !== 'zero') ? '<p class="nomed">El artículo no registra un volumen individual para este día, por eso no se muestra ninguna cifra.</p>' : '';
  $('#tlDetail').innerHTML = `
    <div class="tl-day"><small>DÍA</small><strong>${it.d}</strong><span>${it.name}</span></div>
    <div class="tl-info"><h3>${it.obs}</h3><p class="prod">${it.prod}</p>${nomed}</div>
    <div class="tl-ind">${ind}${it.bar ? '' : '<span class="note">Ilustración cualitativa</span>'}</div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => $$('#tlDetail .scalebar i').forEach(i => { i.style.width = i.dataset.w; })));
}
function selectTl(k, focus) {
  tlSel = k;
  $$('#tl .tl-node').forEach((n, i) => { n.setAttribute('aria-selected', i === k); n.tabIndex = i === k ? 0 : -1; n.classList.toggle('passed', i <= k); });
  if (focus) $$('#tl .tl-node')[k].focus();
  renderTlDetail();
  if (!tlPlaying) sfx.pick();
}
function tlStop() {
  tlPlaying = false; cancelAnimationFrame(tlRaf);
  $('#useTl').setAttribute('href', '#i-play'); $('#lblTl').textContent = 'Recorrer los 40 días';
  const p = $('#tlPlay'); if (p) p.classList.remove('on');
}
function tlPlay() {
  if (tlPlaying) { tlStop(); return; }
  tlPlaying = true;
  $('#useTl').setAttribute('href', '#i-pause'); $('#lblTl').textContent = 'Pausar';
  if (tlSel === TL.length - 1) selectTl(0);
  const dur = 12000, startFrac = (TL[tlSel].d - 1) / 39, t0 = performance.now() - startFrac * dur, head = $('#tlPlay');
  head.classList.add('on');
  const step = now => {
    if (!tlPlaying) return;
    const f = Math.min(1, (now - t0) / dur), day = 1 + f * 39;
    head.style.left = (f * 100) + '%';
    let idx = 0; TL.forEach((t, i) => { if (t.d <= day + 0.001) idx = i; });
    if (idx !== tlSel) selectTl(idx);
    if (f >= 1) { tlStop(); return; }
    tlRaf = requestAnimationFrame(step);
  };
  tlRaf = requestAnimationFrame(step);
}
function initTimeline() {
  const x = d => ((d - 1) / 39 * 100).toFixed(2);
  $('#tl').innerHTML = `<div class="tl-track"><div class="tl-zone adapt"></div><div class="tl-zone meth"></div><span class="tl-zl" style="left:7.7%">Adaptación</span><span class="tl-zl" style="left:87.2%">Metano detectado</span></div><div class="tl-play" id="tlPlay"></div>` +
    TL.map((t, i) => `<button class="tl-node" type="button" role="tab" aria-selected="false" tabindex="-1" style="left:${x(t.d)}%" aria-label="Día ${t.d}: ${t.name}">${t.d}</button><div class="tl-lab ${i % 2 ? 'up' : 'dn'}" style="left:${x(t.d)}%">${t.name}<small>Día ${t.d}</small></div>`).join('');
  $$('#tl .tl-node').forEach((n, i) => n.addEventListener('click', () => { tlStop(); selectTl(i); }));
  rovingKeys($('#tl'), '.tl-node', (j, f) => { tlStop(); selectTl(j, f); });
  $('#btnTlPlay').addEventListener('click', tlPlay);
  selectTl(0);
}
hooks.enter[5] = () => renderTlDetail();
hooks.leave[5] = tlStop;

/* ----------------------------------------------------------
   12. ESCENA 7 · indicadores animados y gráfica
   ---------------------------------------------------------- */
function runCounters() {
  $$('#escena-7 .kpi .v').forEach(el => {
    const to = +el.dataset.count, pre = el.dataset.prefix || '', node = el.firstChild;
    if (reduced) { node.nodeValue = pre + to; return; }
    const t0 = performance.now(), dur = 1400;
    const step = now => { const f = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - f, 3); node.nodeValue = pre + Math.round(to * e); if (f < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}
const CH = {
  a: { max: 850, ticks: [0, 200, 400, 600, 800], tl: v => v + ' mL', legend: [['b-day', 'Valor registrado de un día'], ['b-cum', 'Acumulado registrado']],
    rows: [
      { l: 'Máximo en un día', s: 'Día 14 · registrado', v: 200, c: 'b-day', t: '200 mL', i: 'Valor puntual: el día 14 se registró la mayor producción diaria, 200 mL de metano. Es el valor de un solo día.' },
      { l: 'Acumulado al día 40', s: 'Suma total · registrado', v: 802, c: 'b-cum', t: '802 mL', i: 'Valor acumulado: volumen total de metano al terminar el experimento, 0,802 L (802 mL). Es la suma de todo el período, no el valor de un día.' }
    ] },
  c: { max: 225, ticks: [0, 50, 100, 150, 200], tl: v => v + ' mL/día', legend: [['b-calc', 'Promedio calculado (rayado)'], ['b-day', 'Valor registrado']],
    rows: [
      { l: 'Promedio, fase productiva', s: 'Días 9–40 · 32 días · calculado', v: 25.1, c: 'b-calc', t: '25,1 mL/día', i: 'Calculado: 802 mL ÷ 32 días (del día 9 al día 40). No es una medición diaria.' },
      { l: 'Promedio, 40 días', s: 'Período completo · calculado', v: 20.1, c: 'b-calc', t: '20,1 mL/día', i: 'Calculado: 802 mL ÷ 40 días ≈ 20,1 mL/día. No es una medición diaria.' },
      { l: 'Máximo en un día', s: 'Día 14 · registrado', v: 200, c: 'b-day', t: '200 mL/día', i: 'Valor registrado el día 14. Equivale a cerca de diez veces el promedio de los otros 31 días de la fase productiva (≈19,4 mL/día).' }
    ] }
};
let chartView = 'a';
function renderChart(view) {
  chartView = view;
  $$('#chartTabs button').forEach(b => { const on = b.dataset.view === view; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
  const chart = $('#chart'), axis = $('#caxis'), legend = $('#legend');
  let html = '', ax = '', lg = '';
  if (view === 'b') {
    html = `<div class="stack" role="group" aria-label="Reparto del volumen acumulado">
      <div class="b-day crow-s" tabindex="0" role="button" style="width:${DATA.porcMax}%" data-i="Día 14: 200 mL, el ${fmt(DATA.porcMax)} % del total acumulado. Es el mayor valor diario registrado.">Día 14: 200 mL<small>${fmt(DATA.porcMax)} % del total</small></div>
      <div class="b-cum crow-s" tabindex="0" role="button" style="width:${(100 - DATA.porcMax).toFixed(1)}%;animation-delay:.15s" data-i="El resto del acumulado fueron 602 mL (75,1 %). El artículo los atribuye a los otros 31 días de la fase productiva: ≈19,4 mL/día en promedio. No es una curva diaria: solo se separa el día máximo del resto.">Resto del acumulado: 602 mL<small>${fmt((100 - DATA.porcMax).toFixed(1))} % · ≈19,4 mL/día en los otros 31 días</small></div>
    </div><p class="note" style="margin-top:.5rem">Total acumulado = 802 mL (100 %). No se dibuja una curva diaria porque solo se conservó el registro de seis días.</p>`;
    [0, 25, 50, 75, 100].forEach(t => { ax += `<span style="left:${t}%">${t} %</span>`; });
    axis.style.marginLeft = '0'; axis.style.marginRight = '0';
    lg = [['b-day', 'Día de mayor producción (registrado)'], ['b-cum', 'Resto del acumulado (registrado en total)']].map(([c, t]) => `<span><i class="${c}"></i>${t}</span>`).join('');
  } else {
    const d = CH[view], step = (d.ticks[1] / d.max * 100).toFixed(2);
    html = d.rows.map((r, k) => {
      const w = (r.v / d.max * 100).toFixed(2), inside = r.v / d.max > .6;
      return `<div class="crow" tabindex="0" role="button" data-i="${r.i.replace(/"/g, '&quot;')}"><div class="clab">${r.l}<small>${r.s}</small></div><div class="ctrack" style="--step:${step}%"><div class="cbar ${r.c} ${inside ? '' : 'out'}" style="--w:${w}%;--gd:${k * .12}s"><span class="cv">${r.t}</span></div></div></div>`;
    }).join('');
    d.ticks.forEach(t => { ax += `<span style="left:${(t / d.max * 100).toFixed(2)}%">${d.tl(t)}</span>`; });
    axis.style.marginLeft = ''; axis.style.marginRight = '';
    lg = d.legend.map(([c, t]) => `<span><i class="${c}"></i>${t}</span>`).join('');
  }
  chart.innerHTML = html; axis.innerHTML = ax; legend.innerHTML = lg;
  $('#chartInfo').textContent = 'Pasa el cursor o selecciona una barra para leer qué representa.';
}
function initChart() {
  const tabs = $('#chartTabs');
  tabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { renderChart(b.dataset.view); sfx.pick(); } });
  rovingKeys(tabs, 'button', (j, f) => { const b = $$('button', tabs)[j]; renderChart(b.dataset.view); if (f) b.focus(); });
  const show = e => { const r = e.target.closest('[data-i]'); if (r) { $$('#chart .sel').forEach(x => x.classList.remove('sel')); r.classList.add('sel'); $('#chartInfo').textContent = r.dataset.i; } };
  const chart = $('#chart');
  chart.addEventListener('mouseover', show); chart.addEventListener('focusin', show); chart.addEventListener('click', show);
  renderChart('a');
}
hooks.enter[6] = () => { runCounters(); renderChart(chartView); };

/* ----------------------------------------------------------
   13. ESCENA 8 · lo medido frente a lo propuesto
   ---------------------------------------------------------- */
function initLadder() {
  const svg = $('#escena-8 svg.dig');
  $$('#ladder .rung').forEach(b => b.addEventListener('click', () => {
    $$('#ladder .rung').forEach(x => x.setAttribute('aria-pressed', x === b));
    svg.dataset.focus = b.dataset.focus; sfx.pick();
  }));
}

/* ----------------------------------------------------------
   14. ESCENA 10 · RETO BIODIGESTOR
   ---------------------------------------------------------- */
const TF = [
  { t: 'El metano se detectó desde el primer día.', a: false, e: 'El día 1 se cargaron los residuos y no se produjo metano. Comenzó a detectarse el día 9.' },
  { t: 'La mayor producción diaria registrada fue de 200 mL en el día 14.', a: true, e: 'Esos 200 mL equivalen al 24,9 % del total acumulado.' },
  { t: 'La digestión anaerobia ocurre en ausencia de oxígeno.', a: true, e: 'Distintos microorganismos descomponen la materia orgánica sin oxígeno, en etapas sucesivas.' },
  { t: 'El experimento demostró que se generó electricidad mediante una turbina.', a: false, e: 'La turbina fue una propuesta conceptual. Lo que se midió fue la producción de metano.' },
  { t: 'El volumen acumulado al día 40 fue de 802 mL.', a: true, e: 'Es decir, 0,802 L de metano al terminar los 40 días.' },
  { t: 'El experimento se repitió tres veces para confirmar los resultados.', a: false, e: 'Fue un único ensayo, sin repeticiones. Por eso los resultados no se pueden generalizar.' }
];
const ORD = [
  { t: 'Ordena el proceso', items: ['Residuos orgánicos', 'Digestión anaerobia', 'Producción y acumulación de biogás', 'Aprovechamiento potencial'],
    e: 'Residuos → digestión anaerobia → biogás → aprovechamiento. Ojo: el último paso es potencial; en este experimento solo se midió el metano.' },
  { t: 'Ordena las etapas de la digestión anaerobia', items: ['Hidrólisis', 'Acidogénesis', 'Acetogénesis', 'Metanogénesis'],
    e: 'La metanogénesis es la última etapa: por eso el metano no aparece desde el primer día.' }
];
const G = { mode: null, seq: [], step: 0, score: 0, max: 0, q: [], i: 0, locked: false, o: null, oi: 0 };
const gb = () => $('#gameBody');
const gmood = m => setBiodi($('#gameBiodi'), m);
const scoreChip = () => `<span class="g-score">★ ${G.score} / ${G.max} pts</span>`;

function gameMenu() {
  G.mode = null; gmood('happy');
  gb().innerHTML = `<p class="lead" style="max-width:none">Elige cómo quieres jugar. Aquí se aprende: los errores no restan puntos.</p>
    <div class="g-menu">
      <button class="g-opt" data-mode="tf"><span class="tag">Modalidad A</span><b>Verdadero o falso</b><span>6 afirmaciones sobre el experimento.</span></button>
      <button class="g-opt" data-mode="order"><span class="tag">Modalidad B</span><b>Construye el proceso</b><span>Ordena el proceso y las etapas de la digestión.</span></button>
      <button class="g-opt" data-mode="all"><span class="tag">Reto completo</span><b>A + B</b><span>Hasta 100 puntos. ¿Cuántos logras?</span></button>
    </div>`;
}
function startGame(mode) {
  $$('#gameCard .confetti').forEach(c => c.remove());
  G.mode = mode; G.score = 0; G.step = 0;
  G.seq = mode === 'all' ? ['tf', 'order'] : [mode];
  G.max = (G.seq.includes('tf') ? TF.length * 10 : 0) + (G.seq.includes('order') ? ORD.length * 20 : 0);
  nextPhase();
}
function nextPhase() {
  const ph = G.seq[G.step];
  if (!ph) return gameEnd();
  if (ph === 'tf') { G.q = shuffle(TF); G.i = 0; showTF(); }
  else { G.oi = 0; showOrder(); }
}
/* --- Modalidad A: verdadero o falso --- */
function showTF() {
  const q = G.q[G.i]; G.locked = false; gmood('think');
  gb().innerHTML = `<div class="g-top"><span>Pregunta ${G.i + 1} de ${G.q.length}</span><div class="gprog"><i style="width:${G.i / G.q.length * 100}%"></i></div>${scoreChip()}</div>
    <p class="g-statement">«${q.t}»</p>
    <div class="g-choices"><button class="btn big choice t" data-ans="1">Verdadero <span class="sec" style="font-weight:600;font-size:.7em">(1)</span></button><button class="btn big choice f" data-ans="0">Falso <span class="sec" style="font-weight:600;font-size:.7em">(2)</span></button></div>
    <div id="gfb"></div>`;
}
function answerTF(val) {
  if (G.locked) return; G.locked = true;
  const q = G.q[G.i], ok = val === q.a;
  if (ok) G.score += 10;
  $$('.choice').forEach(b => { b.disabled = true; const isT = b.dataset.ans === '1'; if (isT === q.a) b.classList.add('right'); else if ((b.dataset.ans === '1') === val) b.classList.add('wrong'); });
  gmood(ok ? 'happy' : 'oops'); ok ? sfx.ok() : sfx.no();
  const last = G.i === G.q.length - 1;
  $('#gfb').innerHTML = `<div class="g-fb ${ok ? 'ok' : 'no'}"><span class="biodi">${biodi(ok ? 'happy' : 'oops')}</span><p><b>${ok ? '¡Correcto! +10 puntos' : '¡Casi! Así se aprende, no pierdes puntos.'}</b>${q.e}</p></div>
    <div class="g-actions"><button class="btn primary big" id="gNext">${last ? 'Continuar' : 'Siguiente pregunta'} <svg class="ic"><use href="#i-right"/></svg></button></div>`;
  $$('.g-top .g-score').forEach(s => s.textContent = `★ ${G.score} / ${G.max} pts`);
  $$('.g-top .gprog i').forEach(i => i.style.width = ((G.i + 1) / G.q.length * 100) + '%');
  $('#gNext').focus();
}
function advanceTF() { if (G.i < G.q.length - 1) { G.i++; showTF(); } else { G.step++; nextPhase(); } }

/* --- Modalidad B: construye el proceso (clic o teclado) --- */
function showOrder() {
  const r = ORD[G.oi];
  G.o = { r, cards: shuffle(r.items.map((t, idx) => ({ t, idx }))), slots: [null, null, null, null], attempts: 0, best: 0, mark: null, done: false, revealed: false };
  let tries = 0; while (G.o.cards.every((c, k) => c.idx === k) && tries++ < 8) G.o.cards = shuffle(G.o.cards);
  gmood('think'); renderOrder();
}
function renderOrder(focusId) {
  const o = G.o, placed = new Set(o.slots.filter(s => s !== null));
  const fid = focusId || (document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.fid : null);
  const filled = o.slots.every(s => s !== null);
  const slotHtml = o.slots.map((c, k) => {
    const cls = o.mark ? (o.mark[k] ? 'ok' : 'near') : '';
    return c === null
      ? `<button class="slot" data-slot="${k}" data-fid="slot-${k}" aria-label="Posición ${k + 1}, vacía"><span class="sn">${k + 1}</span></button>`
      : `<button class="slot filled ${cls}" data-slot="${k}" data-fid="slot-${k}" aria-label="Posición ${k + 1}: ${o.cards.find(x => x.idx === c).t}. Toca para devolverla"><span class="sn">${k + 1}</span>${o.cards.find(x => x.idx === c).t}</button>`;
  }).join('');
  const pool = o.cards.filter(c => !placed.has(c.idx)).map(c => `<button class="ocard" data-card="${c.idx}" data-fid="card-${c.idx}">${c.t}</button>`).join('');
  const total = ORD.length;
  let msg = '', actions = '';
  if (o.done) {
    msg = `<div class="g-fb ok"><span class="biodi">${biodi('happy')}</span><p><b>${o.revealed ? 'Este es el orden correcto' : '¡Orden correcto! +' + o.pts + ' puntos'}</b>${o.r.e}</p></div>`;
    actions = `<div class="g-actions"><button class="btn primary big" id="oNext">${G.oi === total - 1 ? 'Continuar' : 'Siguiente reto'} <svg class="ic"><use href="#i-right"/></svg></button></div>`;
  } else {
    if (o.mark) { const n = o.mark.filter(Boolean).length; msg = `<div class="g-fb no"><span class="biodi">${biodi('oops')}</span><p><b>${n === 0 ? 'Todavía no, ¡pero así se aprende!' : 'Vas bien: ' + n + ' de 4 en su lugar.'}</b>Las casillas en amarillo no van ahí. Toca una para devolverla a las tarjetas y prueba otro orden.</p></div>`; }
    else msg = `<p class="o-hint">Toca las tarjetas en el orden en que ocurren. Para corregir, toca una casilla ocupada y la tarjeta vuelve abajo.</p>`;
    actions = `<div class="g-actions">${o.attempts >= 2 ? '<button class="btn" id="oReveal">Mostrar la respuesta</button>' : ''}<button class="btn" id="oReset"><svg class="ic"><use href="#i-replay"/></svg> Empezar de nuevo</button><button class="btn amber big" id="oCheck" ${filled ? '' : 'disabled'}><svg class="ic"><use href="#i-check"/></svg> Comprobar</button></div>`;
  }
  gb().innerHTML = `<div class="g-top"><span>Reto ${G.oi + 1} de ${total} · ${o.r.t}</span><div class="gprog"><i style="width:${(G.oi + (o.done ? 1 : 0)) / total * 100}%"></i></div>${scoreChip()}</div>
    <div class="o-slots" role="group" aria-label="Orden del proceso">${slotHtml}</div>
    <div class="o-pool" role="group" aria-label="Tarjetas disponibles">${pool || '<span class="o-hint">Todas las tarjetas están colocadas.</span>'}</div>
    ${msg}${actions}`;
  let target = fid ? $(`[data-fid="${fid}"]`) : null;
  if (!target && fid) target = $('.ocard') || $('#oCheck:not([disabled])') || $('#oNext');
  if (o.done) target = $('#oNext');
  if (target) target.focus({ preventScroll: true });
}
function orderPlace(idx) { const o = G.o; const k = o.slots.indexOf(null); if (k < 0) return; o.slots[k] = idx; o.mark = null; sfx.pick(); renderOrder(); }
function orderRemove(k) { const o = G.o; if (o.slots[k] === null || o.done) return; o.slots[k] = null; o.mark = null; sfx.pick(); renderOrder(); }
function orderCheck() {
  const o = G.o; o.attempts++;
  o.mark = o.slots.map((c, k) => c === k);
  const n = o.mark.filter(Boolean).length; o.best = Math.max(o.best, n);
  if (n === 4) {
    o.pts = o.attempts === 1 ? 20 : o.attempts === 2 ? 15 : 10;
    G.score += o.pts; o.done = true; gmood('happy'); sfx.ok(); renderOrder();
  } else { gmood('oops'); sfx.no(); renderOrder('oCheck'); }
}
function orderReveal() {
  const o = G.o; o.slots = [0, 1, 2, 3]; o.mark = [true, true, true, true]; o.done = true; o.revealed = true;
  G.score += o.best * 5; gmood('think'); renderOrder();
}
function orderNext() { if (G.oi < ORD.length - 1) { G.oi++; showOrder(); } else { G.step++; nextPhase(); } }

/* --- Final --- */
function gameEnd() {
  const pct = G.score / G.max, stars = pct >= .85 ? 3 : pct >= .5 ? 2 : 1;
  const title = stars === 3 ? '¡Excelente, científico del biodigestor!' : stars === 2 ? '¡Muy bien! Ya casi lo dominas' : '¡Buen intento! Repasa y vuelve a probar';
  const txt = stars === 3 ? 'Entendiste lo medido, lo calculado y lo que solo es una propuesta.' : stars === 2 ? 'Entendiste lo esencial. Revisa las escenas 6 y 7 y mejora tu puntaje.' : 'Equivocarse también es hacer ciencia. Recorre las escenas del experimento y vuelve a jugar.';
  gmood(stars === 3 ? 'happy' : 'think'); stars === 3 ? sfx.win() : sfx.ok();
  gb().innerHTML = `<div class="g-end"><span class="biodi">${biodi(stars === 3 ? 'happy' : 'think')}</span>
    <div class="stars" aria-label="${stars} de 3 estrellas">${[1, 2, 3].map(n => `<span class="${n <= stars ? '' : 'off'}">★</span>`).join('')}</div>
    <div class="score-big">${G.score}<small> / ${G.max} puntos</small></div>
    <h3>${title}</h3><p style="max-width:40rem">${txt}</p>
    <div class="g-actions"><button class="btn" id="gMenu">Elegir otra modalidad</button><button class="btn primary big" id="gAgain"><svg class="ic"><use href="#i-replay"/></svg> Volver a jugar</button></div></div>`;
  if (stars === 3 && !reduced) confetti();
  $('#gAgain').focus();
}
function confetti() {
  const card = $('#gameCard'), box = document.createElement('div'); box.className = 'confetti';
  const cols = ['#f2a900', '#1f8a5b', '#4a90c8', '#ffcf4a', '#4fb06f'];
  for (let i = 0; i < 46; i++) { const p = document.createElement('i'); p.style.left = Math.random() * 100 + '%'; p.style.background = cols[i % cols.length]; p.style.animationDelay = Math.random() * .8 + 's'; p.style.animationDuration = 2 + Math.random() * 1.6 + 's'; box.appendChild(p); }
  card.appendChild(box); setTimeout(() => box.remove(), 4500);
}
function initGame() {
  gb().addEventListener('click', e => {
    const t = e.target;
    let el;
    if ((el = t.closest('[data-mode]'))) startGame(el.dataset.mode);
    else if ((el = t.closest('.choice'))) answerTF(el.dataset.ans === '1');
    else if (t.closest('#gNext')) advanceTF();
    else if ((el = t.closest('.ocard'))) orderPlace(+el.dataset.card);
    else if ((el = t.closest('.slot'))) orderRemove(+el.dataset.slot);
    else if (t.closest('#oCheck')) orderCheck();
    else if (t.closest('#oReset')) { G.o.slots = [null, null, null, null]; G.o.mark = null; renderOrder('card-0'); }
    else if (t.closest('#oReveal')) orderReveal();
    else if (t.closest('#oNext')) orderNext();
    else if (t.closest('#gAgain')) startGame(G.mode);
    else if (t.closest('#gMenu')) gameMenu();
  });
  document.addEventListener('keydown', e => {
    if (cur !== 9 || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!$('.choice') || G.locked) return;
    if (e.key === '1') { e.preventDefault(); answerTF(true); } else if (e.key === '2') { e.preventDefault(); answerTF(false); }
  });
  gameMenu();
}

/* ----------------------------------------------------------
   15. ARRANQUE
   ---------------------------------------------------------- */
function init() {
  buildDots();
  mountArt();
  initParts(); initStages(); initPhases(); initTimeline(); initChart(); initLadder(); initGame();
  const m = /#escena-(\d+)/.exec(location.hash);
  goTo(m ? +m[1] - 1 : 0, true);
  window.addEventListener('hashchange', () => { const h = /#escena-(\d+)/.exec(location.hash); if (h) goTo(+h[1] - 1); });
}
init();
})();
