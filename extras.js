// PON AQUÍ TU NOMBRE (se muestra en «Acerca de»). CONTACT es opcional: déjalo '' para no mostrarlo.
const AUTHOR = 'TU NOMBRE AQUÍ', CONTACT = '', VERSION = '1.0.0';

// ---- Temas: [nombre, 'claro | oscuro'] con fondo, bloques, líneas, texto suave, acción y texto de acción ----
const SK = [
  ['Caja fuerte', 'e8edf0 f8fafb d3dce1 51656f 0b5563 ffffff|0d1a21 15262f 263a44 8fa3ad c8a24a 1b1604'],
  ['Bosque', 'e7ebe1 f7f8f3 cfd6c6 56634f 2f5d3a ffffff|111913 1a261d 2a3b2e 91a595 9cc48b 0f1d12'],
  ['Atardecer', 'f1e6ea fff8fa e3cfd6 7a5866 8c2f5b ffffff|1a0f17 281823 3d2735 b596a5 f0a0c4 3a0a22'],
  ['Océano', 'e3eef8 f6fafe c9dbea 4c6479 0b5fa5 ffffff|08131f 112238 1f3752 8ca5bf 6cb6ff 04223f'],
  ['Grafito', 'eaeaea fafafa d6d6d6 5e5e5e 2b2b2b ffffff|121212 1e1e1e 2e2e2e 9a9a9a e8e8e8 1a1a1a']
];
function applySkin() {
  const m = localStorage.pb_mode || 'auto', dark = m === 'dark' || (m === 'auto' && matchMedia('(prefers-color-scheme:dark)').matches);
  const c = SK[+localStorage.pb_skin || 0][1].split('|')[dark ? 1 : 0].split(' '), r = document.documentElement;
  ['bg', 'sf', 'ln', 'mu', 'pr', 'op'].forEach((k, j) => r.style.setProperty('--' + k, '#' + c[j]));
  r.style.setProperty('--tx', dark ? '#e8eef1' : '#11242d'); r.style.setProperty('--er', dark ? '#f2b8b5' : '#b3261e');
  r.style.colorScheme = dark ? 'dark' : 'light';
  document.querySelector('meta[name=theme-color]').content = '#' + c[0];
}

// ---- Medidor de fuerza ----
const meter = p => {
  if (!p) return ''; let c = 0; [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].forEach(r => r.test(p) && c++);
  const s = Math.min(p.length, 20) / 20 * .6 + c / 4 * .4, L = s < .35 ? 1 : s < .6 ? 2 : s < .85 ? 3 : 4, C = ['', '#c0392b', '#d68910', '#4f8f3a', '#1f7a5c'][L];
  return `<div style="display:flex;gap:6px;align-items:center">${[1, 2, 3, 4].map(i => `<i style="flex:1;height:6px;border-radius:3px;background:${i <= L ? C : 'var(--ln)'}"></i>`).join('')}<b style="color:${C};font-size:13px;width:72px;text-align:right">${['', 'Débil', 'Media', 'Buena', 'Excelente'][L]}</b></div>`;
};

// ---- Importar: lee texto con una entrada por bloque (sitio, usuario, contraseña) ----
const LBL = /^(dni|nie|firma|pin|clave|usuario|user|contrase[ñn]a|password|pass|cuenta|iban|tarjeta|n[uú]mero|c[oó]digo)(?:\s*[:=].*|\s+.*)?$/i;
function parse(t) {
  const out = []; let b = [];
  const fl = () => { if (b.length) { const s = b[0], r = b.slice(1); out.push(r.length >= 2 && !LBL.test(r[0]) && !LBL.test(r[1]) ? { site: s, username: r[0], password: r[1], notes: r.slice(2).join('\n') } : { site: s, username: '', password: '', notes: r.join('\n') }); } b = []; };
  for (const l of t.split(/\r\n|\r|\n/)) { const x = l.trim(); x ? b.push(x) : fl(); }
  fl(); return out;
}
let IMP = [];
const hasData = e => e.username || e.password || e.notes;
const dup = e => S.vault.entries.some(x => !x.deleted && x.site.toLowerCase() === e.site.toLowerCase() && x.username.toLowerCase() === e.username.toLowerCase());
const okList = () => IMP.filter(e => hasData(e) && !dup(e));

// ---- Pantallas ----
const sub = (t, body) => `<div style="margin-bottom:8px"><button class="t" data-a="back2">← Volver</button></div><h1>${t}</h1><div style="margin-top:14px">${body}</div>`;
const det = (t, b, o) => `<details ${o ? 'open' : ''} class="card" style="padding:14px 16px;margin-bottom:10px"><summary style="font-weight:700;cursor:pointer">${t}</summary><div style="margin-top:10px">${b}</div></details>`;
const note = t => `<p style="background:#d6891822;border:1px solid #d6891877;border-radius:12px;padding:10px 12px">${t}</p>`;

V.more = () => sub('Más opciones', `<div class="card">${[['imp', '📥', 'Importar contraseñas'], ['theme', '🎨', 'Apariencia'], ['help', '❓', 'Ayuda'], ['about', 'ℹ️', 'Acerca de Pass Box']].map(([a, i, t]) => `<div class="row" data-a="${a}" style="padding:16px;cursor:pointer"><span>${i}</span><b class="grow">${t}</b></div>`).join('')}</div>`);

V.theme = () => {
  const i = +localStorage.pb_skin || 0, m = localStorage.pb_mode || 'auto';
  return sub('Apariencia', `<div class="card">${SK.map((s, k) => { const [l, d] = s[1].split('|').map(x => x.split(' ')); return `<div class="row" data-a="skin" data-id="${k}" style="padding:14px;cursor:pointer"><span style="display:flex;gap:4px"><i style="width:20px;height:20px;border-radius:50%;background:#${l[4]}"></i><i style="width:20px;height:20px;border-radius:50%;background:#${d[4]}"></i></span><b class="grow">${s[0]}</b><b>${k === i ? '✓' : ''}</b></div>`; }).join('')}</div>
<label>Modo</label><div style="display:flex;gap:8px">${[['auto', 'Sistema'], ['light', 'Claro'], ['dark', 'Oscuro']].map(([x, n]) => `<button class="${m === x ? '' : 's'}" style="flex:1" data-a="mode" data-id="${x}">${n}</button>`).join('')}</div>
<p class="mu">Este ajuste solo afecta a este dispositivo.</p>`);
};

V.help = () => sub('Ayuda', `<p class="mu">Toca cada apartado para abrirlo.</p>
${det('Primeros pasos', `<p>La primera vez, Pass Box te pide que crees una contraseña maestra. Es la única que tendrás que recordar: con ella se abre todo lo demás.</p><p>Elige una frase larga que puedas recordar, por ejemplo cuatro palabras sin relación entre sí, como «luna paraguas tractor nube».</p>${note('La contraseña maestra no se puede recuperar. Si la olvidas, nadie podrá abrir tu baúl. Apúntala en un papel y guárdalo en un lugar seguro de tu casa.')}`)}
${det('Guardar y usar tus contraseñas', `<p>Pulsa «Añadir» y rellena el sitio, el usuario y la contraseña. El botón «Generar» crea una contraseña segura.</p><p>Para usar una contraseña, búscala en la lista y pulsa 🔑: se copia. Pégala en la web o la aplicación (mantén pulsado en el móvil). 👤 copia el usuario. Para editar o borrar, pulsa sobre la entrada.</p>`)}
${det('Sincronizar con otros dispositivos', `<p>Pass Box puede mantener tus contraseñas iguales en tu ordenador y en tu móvil usando Dropbox, un servicio gratuito para guardar archivos en internet.</p><p>Necesitas una cuenta de Dropbox. Si no tienes, <a href="https://www.dropbox.com/register" target="_blank" rel="noopener">puedes crearla gratis aquí</a>.</p><ol><li>Instala Pass Box en cada dispositivo.</li><li>Crea el baúl con <b>la misma contraseña maestra</b> en todos.</li><li>Pulsa ☁️ y luego «Abrir Dropbox». Inicia sesión y pulsa «Permitir».</li><li>Copia el código que te muestra, vuelve a Pass Box, pégalo y pulsa «Conectar».</li></ol><p>Desde ahí se sincroniza al abrir y al guardar cambios, o a mano con ☁️. Tus contraseñas viajan cifradas: Dropbox no puede leerlas. Cada persona usa su propia cuenta y su propio baúl.</p>`, 1)}
${det('Importar contraseñas', `<p>En «Más opciones» (⚙️), elige «Importar contraseñas». Pega el texto, pulsa «Analizar» y revisa la vista previa. Cada entrada va separada de la siguiente por una línea en blanco: sitio, usuario y contraseña, cada uno en su línea.</p>${note('Después, borra el archivo de texto original si no está protegido.')}`)}
${det('En el iPhone', `<p>Añade Pass Box a la pantalla de inicio (Compartir → «Añadir a pantalla de inicio») y <b>usa siempre ese icono</b>: Safari y el icono guardan los datos por separado. El iPhone puede no vaciar el portapapeles automáticamente.</p>`)}
${det('Seguridad', `<p>Pass Box se bloquea sola tras 2 minutos sin usarla y al salir de la pantalla. Tus contraseñas se cifran en tu dispositivo antes de guardarse o subirse a Dropbox, y la contraseña maestra no se guarda en ningún sitio.</p>`)}
${det('Preguntas frecuentes', `<p><b>Dice que el baúl de Dropbox usa otra contraseña maestra.</b><br>Ese dispositivo se creó con una contraseña distinta. Todos tus dispositivos deben usar la misma.</p><p><b>Dropbox no me deja conectar o el código da error.</b><br>Comprueba tu conexión y repite «Abrir Dropbox» para obtener un código nuevo, porque caduca. Si Dropbox indica que no puedes usar la aplicación, avisa a quien te la ha pasado.</p><p><b>No se pudo sincronizar.</b><br>Tus cambios se guardan igualmente en este dispositivo. Pulsa ☁️ cuando vuelvas a tener conexión.</p><p><b>He olvidado la contraseña maestra.</b><br>No se puede recuperar: habría que empezar con un baúl nuevo y se perderían las contraseñas guardadas.</p>`)}
<button class="s" style="width:100%;margin-top:6px" data-a="about">Acerca de Pass Box</button>`);

V.about = () => sub('Acerca de', `<div style="text-align:center"><img src="icon-192.png" width="110" height="110" alt="" style="border-radius:26px"><h1 style="margin-top:12px">Pass Box</h1><div class="mu">Versión ${VERSION}</div></div>
<div class="card" style="margin-top:18px"><div class="row" style="display:block"><div class="mu">Creado por</div><b>${esc(AUTHOR)}</b></div>${CONTACT ? `<div class="row" style="display:block"><div class="mu">Contacto</div><b>${esc(CONTACT)}</b></div>` : ''}<div class="row" style="display:block"><div class="mu">Diseñado con la ayuda de</div><b>Claude, un asistente de IA de Anthropic</b></div></div>
${det('Cómo protege tus datos', '<p>Tus contraseñas se cifran en tu dispositivo con AES-256-GCM, con una clave derivada de tu contraseña maestra mediante Argon2id, antes de guardarse o subirse a Dropbox. La contraseña maestra nunca se guarda. Pass Box no tiene servidores propios ni anuncios, y solo envía datos a tu propio Dropbox si tú lo conectas, siempre cifrados. Ni Dropbox ni el autor pueden leerlos sin tu contraseña maestra.</p>', 1).replace('class="card"', 'class="card" style="margin-top:14px"')}
${det('Importante', '<p>Pass Box es un programa personal, creado de forma independiente y sin auditoría de seguridad externa. Se ofrece tal cual, sin garantías. Guarda siempre una copia de lo realmente importante y anota tu contraseña maestra en un lugar seguro.</p>', 1)}
${det('Marcas y licencias', '<p>Pass Box es un proyecto independiente: no está afiliado a Anthropic ni a Dropbox, ni cuenta con su respaldo. Claude, Anthropic y Dropbox son marcas de sus respectivos propietarios. Pass Box utiliza software de código abierto.</p><button class="s" data-a="lic">Ver licencias de código abierto</button><pre id="lic" style="white-space:pre-wrap;font-size:12px"></pre>', 1)}`);

V.imp = () => sub('Importar contraseñas', `<p class="mu">Pega el texto con tus contraseñas. Cada entrada va separada de la siguiente por una línea en blanco: primero el sitio, luego el usuario y después la contraseña, cada uno en su línea.</p><textarea id="imp_t" rows="8" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Pega aquí el texto"></textarea><button class="s" style="width:100%;margin-top:12px" data-a="impan">Analizar texto</button><div id="imp_r" style="margin-top:14px"></div>`);

// ---- Ajustes de pantallas existentes ----
const u0 = V.unlock, l0 = V.list, e0 = V.edit;
V.unlock = () => u0().replace('<div class="err" id="err">', '<div id="sm" style="margin-top:12px"></div><div class="err" id="err">') + '<p style="text-align:center;margin-top:18px"><button class="t" data-a="help">Ayuda</button><button class="t" data-a="theme">Apariencia</button></p>';
V.list = () => l0().replace('<button class="t" data-a="lock"', '<button class="t" data-a="more" aria-label="Más opciones">⚙️</button><button class="t" data-a="lock"');
V.edit = () => { setTimeout(() => { const f = $('#f_pw'); if (f && $('#sm')) $('#sm').innerHTML = meter(f.value); }, 0); return e0().replace('<label>Notas</label>', '<div id="sm" style="margin-top:10px"></div><label>Notas</label>'); };

// ---- Acciones ----
Object.assign(A, {
  back2() { S.v = S.vault ? 'list' : 'unlock'; render(); },
  more() { S.v = 'more'; render(); }, help() { S.v = 'help'; render(); }, about() { S.v = 'about'; render(); }, theme() { S.v = 'theme'; render(); },
  imp() { IMP = []; S.v = 'imp'; render(); },
  skin(i) { localStorage.pb_skin = i; applySkin(); render(); }, mode(m) { localStorage.pb_mode = m; applySkin(); render(); },
  async lic() { try { $('#lic').textContent = 'hash-wasm (librería Argon2)\n\n' + await (await fetch('LICENSE-hash-wasm.txt')).text(); } catch { toast('No se pudo cargar el texto de la licencia.'); } },
  impan() {
    IMP = parse($('#imp_t').value); const ok = okList();
    $('#imp_r').innerHTML = IMP.length ? `<p><b>Se han encontrado ${IMP.length} entradas. Se importarán ${ok.length}.</b></p><p class="mu">Revisa que el número sea el esperado. Aquí no se muestran las contraseñas.</p><div class="card">${IMP.map(e => `<div class="row"><div class="tag" style="background:${col(e.site)}">${esc((e.site[0] || '?').toUpperCase())}</div><div class="grow"><b>${esc(e.site)}</b><span class="mu">${!hasData(e) ? 'Sin datos: se omite' : dup(e) ? 'Ya existe: se omite' : e.username && e.password ? 'Usuario y contraseña' : 'Datos en notas'}</span></div></div>`).join('')}</div><button style="width:100%;margin-top:14px" data-a="impgo" ${ok.length ? '' : 'disabled'}>Importar ${ok.length} entradas</button><p class="mu">Al importar se intenta vaciar el portapapeles.</p>` : '<p class="mu">No se ha encontrado ninguna entrada.</p>';
  },
  impgo() {
    const ok = okList(); ok.forEach(e => S.vault.entries.push({ id: hex(rnd(16)), deleted: false, modified: Date.now(), ...e }));
    IMP = []; navigator.clipboard?.writeText('').catch(() => {}); toast('Se importaron ' + ok.length + ' entradas.'); S.v = 'list'; persist();
  }
});
document.addEventListener('input', e => { if (e.target.id === 'f_pw' || (e.target.id === 'pw' && $('#pw2'))) { const s = $('#sm'); if (s) s.innerHTML = meter(e.target.value); } });
matchMedia('(prefers-color-scheme:dark)').addEventListener('change', () => { applySkin(); });
applySkin(); render();
