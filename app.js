const LAMP = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 21h6M10 17h4M12 3a6 6 0 0 0-4 10c.6.6 1 1.5 1 2.4V16h6v-.6c0-.9.4-1.8 1-2.4A6 6 0 0 0 12 3z"
      fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

// Usar CONFIG si está disponible, o valores por defecto
const KEYS = (typeof CONFIG !== 'undefined' && CONFIG.KEYS) ? CONFIG.KEYS : {
  token: "energiai.token",
  email: "energiai.email",
  nombre: "energiai.nombre",
  theme: "energiai-theme",
  set: "energiai-set",
  next: "energiai.next",
  result: "energiai.result",
  form: "energiai.form",
  authError: "energiai.authError"
};

// URL base de la API
const API_BASE = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE) ? CONFIG.API_BASE : "";

const MESES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const WIZARD = [
  { key: "tipo_inmueble", title: "¿Qué tipo de vivienda es?" },
  { key: "month", title: "¿De qué mes es la factura?" },
  { key: "uso_horario_pico", title: "¿Usas horario pico?" },
  { key: "horas_alto_consumo", title: "¿Cuántas horas de alto consumo por día?" },
  { key: "cantidad_equipos", title: "¿Cuántos equipos hay?" },
  { key: "consumo_mensual", title: "¿Cuántos kWh consumiste en el mes?" },
  { key: "numero_personas", title: "¿Cuántas personas viven ahí? (opcional)" },
  { key: "tarifa_electrica", title: "¿Cuál es tu tarifa por kWh? (opcional)" },
  { key: "antiguedad_electrodomesticos", title: "Antigüedad de los equipos (opcional)" },
  { key: "flags", title: "¿Qué equipos tienes?" }
];

function restoreSession() {
  try {
    // Solo restaurar resultado si el usuario está logueado
    if (state.auth) {
      const r = sessionStorage.getItem(KEYS.result);
      if (r) state.result = sanitizeResult(JSON.parse(r));
    }
    // NO restaurar formulario automáticamente - el usuario debe completarlo
  } catch (_) { /* ignore */ }
}

function sanitizeResult(r) {
  if (!r || typeof r !== "object") return r;
  const copy = { ...r };
  const consumo = pick(copy, "consumoMensual", "consumo_mensual")
    || pick(copy.consulta_modelo || copy.consultaModelo || {}, "consumo_mensual", "consumoMensual");
  if (consumo != null && copy.consumoMensual == null && copy.consumo_mensual == null) {
    copy.consumo_mensual = consumo;
  }
  delete copy.vector_onnx;
  delete copy.vectorOnnx;
  delete copy.consulta_modelo;
  delete copy.consultaModelo;
  delete copy.features_sinteticas;
  delete copy.featuresSinteticas;
  return copy;
}

function persistSession() {
  try {
    sessionStorage.setItem(KEYS.result, JSON.stringify(sanitizeResult(state.result)));
    sessionStorage.setItem(KEYS.form, JSON.stringify(state.form));
  } catch (_) { /* ignore */ }
}

const ANTIGUEDADES = [
  "menor a 3 años",
  "menor a 5 años",
  "menor a 10 años",
  "mayor a 10 años"
];

const CAT = { EFICIENTE: "Eficiente", MODERADO: "Moderado", INEFICIENTE: "Ineficiente" };

function $(sel, root = document) { return root.querySelector(sel); }

function pick(obj, ...keys) {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
  }
  return undefined;
}

function mesNumero(valor) {
  if (valor == null) return null;
  const n = Number(valor);
  if (n >= 1 && n <= 12) return n;
  const i = MESES.findIndex((m) => m.toLowerCase() === String(valor).toLowerCase());
  return i > 0 ? i : null;
}

function etiquetaCat(c) {
  if (!c) return "—";
  return CAT[c] || CAT[String(c).toUpperCase()] || String(c);
}

function fmt(n, d = 1) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString("es", { maximumFractionDigits: d, minimumFractionDigits: 0 });
}

function fmtMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function deviceDe() {
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1100) return "tablet";
  return "web";
}

function loadAuth() {
  const token = localStorage.getItem(KEYS.token);
  if (!token) return null;
  return {
    token,
    email: localStorage.getItem(KEYS.email) || "",
    nombre: localStorage.getItem(KEYS.nombre) || ""
  };
}

function applyAuth(token, email, nombre) {
  if (token) localStorage.setItem(KEYS.token, token);
  localStorage.setItem(KEYS.email, email || "");
  localStorage.setItem(KEYS.nombre, nombre || localStorage.getItem(KEYS.nombre) || "");
  state.auth = loadAuth() || (email ? { token: token || "", email, nombre: nombre || "" } : null);
}

function defaultForm() {
  return {
    tipo_inmueble: "",
    month: "",
    uso_horario_pico: "",
    horas_alto_consumo: "",
    cantidad_equipos: "",
    consumo_mensual: "",
    numero_personas: "",
    tiene_aire_acondicionado: false,
    tiene_calentador: false,
    tiene_iluminacion_led: false,
    antiguedad_electrodomesticos: "",
    tarifa_electrica: "",
    guardar: true
  };
}

const state = {
  set: localStorage.getItem(KEYS.set) || "id",
  device: deviceDe(),
  screen: "inicio",
  theme: localStorage.getItem(KEYS.theme) || "light",
  auth: loadAuth(),
  form: defaultForm(),
  result: null,
  historial: [],
  error: null,
  notice: null,
  loginTab: "login",
  loading: false,
  detalleId: null,
  wizardStep: 0
};

restoreSession();

function loginHref(nextHash, tab) {
  return "#entrar" + (tab === "registro" ? "/registro" : "");
}

function queueLogin(tab, nextHash) {
  const next = "/index.html" + (nextHash || location.hash || "#inicio");
  sessionStorage.setItem(KEYS.next, next);
  state.loginTab = tab === "registro" ? "registro" : "login";
  go(tab === "registro" ? "entrar/registro" : "entrar");
}

function esIpPrivada() {
  const host = location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return false;
  // RFC 1918: 10.x.x.x, 172.16-31.x.x, 192.168.x.x
  if (/^10\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  return false;
}

async function empezarGoogle() {
  // Google OAuth no funciona desde IPs privadas (LAN) - requiere device_id/device_name
  if (esIpPrivada()) {
    state.error = "Google OAuth no está disponible desde IPs de red local. Usá email y contraseña, o accedé desde localhost.";
    if (state.screen !== "entrar") queueLogin("login");
    else render();
    return;
  }
  try {
    const info = await api("/api/auth/proveedores", { auth: false });
    if (!info.google) {
      state.error = "Google no está disponible en este entorno. Entrá con email y contraseña.";
      if (state.screen !== "entrar") queueLogin("login");
      else render();
      return;
    }
  } catch (_) { /* si el probe falla, igual intentamos el flujo del IdP */ }
  location.assign("/oauth2/authorization/google");
}

function wordmark() {
  return `<span class="word">Energi<span class="ai">AI</span></span>`;
}

function lockup({ compact = false, inverse = false } = {}) {
  const inv = inverse || state.theme === "dark";
  const cls = `lockup${compact ? " compact" : ""}${inv ? " inverse" : ""}`;
  return `<div class="${cls}" aria-label="EnergiAI"><img class="mark" src="/img/logo-mark.png" alt="">${wordmark()}</div>`;
}

function markOnly() {
  return `<img class="mark" src="/img/logo-mark.png" alt="EnergiAI">`;
}

function bannerBrand(size = "") {
  return `<div class="banner-plate${size ? " " + size : ""}"><img src="/img/logo-banner.svg" alt="EnergiAI"></div>`;
}

function lamp(a11y) {
  const dark = state.theme === "dark";
  const label = dark ? "Modo claro" : "Modo oscuro";
  const cls = `theme-toggle${dark ? " filled" : ""}${a11y ? " a11y" : ""}`;
  return `<button class="${cls}" type="button" data-action="theme" aria-pressed="${dark}" aria-label="${label}" title="${label}">
    ${LAMP}${a11y ? `<span>${label}</span>` : ""}
  </button>`;
}

function hatch(n = 8) {
  return `<div class="hatch" aria-hidden="true">${"<i></i>".repeat(n)}</div>`;
}

function authButtons(hideIfLoginScreen = false) {
  if (state.auth) {
    const who = state.auth.nombre || state.auth.email;
    return `<span class="user-chip" title="${esc(state.auth.email)}">${esc(who)}</span>
      <button class="btn ghost" type="button" data-action="logout">Salir</button>`;
  }
  if (hideIfLoginScreen && state.screen === "entrar") return "";
  return `<button class="btn ghost" type="button" data-action="login">Entrar</button>
    <button class="btn primary" type="button" data-action="registro">Crear cuenta</button>`;
}

function navLinks() {
  return `<nav class="nav">
    <button class="link${state.screen === "inicio" ? " on" : ""}" type="button" data-go="inicio">Inicio</button>
    <button class="link${state.screen === "analisis" ? " on" : ""}" type="button" data-go="analisis">Análisis</button>
    <button class="link${state.screen === "resultados" ? " on" : ""}" type="button" data-go="resultados">Resultados</button>
    <button class="link${state.screen === "historial" ? " on" : ""}" type="button" data-go="historial">Historial</button>
    <button class="link" type="button" data-action="a11y">${state.set === "a11y" ? "Vista estándar" : "Accesible"}</button>
  </nav>`;
}

function headerId() {
  if (state.device !== "web") {
    return `<div class="header">${navLinks()}<div class="header-actions">${authButtons(true)}</div></div>`;
  }
  return `<div class="header">
    <a href="#inicio">${lockup()}</a>
    ${navLinks()}
    <div class="header-actions">${lamp(false)}${authButtons(true)}</div>
  </div>`;
}

function chromeId() {
  if (state.device === "web") {
    return `<aside class="rail">${markOnly()}<span class="cap">IA</span><div class="pulse"></div></aside>`;
  }
  const brand = state.device === "tablet" ? lockup({ compact: true, inverse: true }) : markOnly();
  return `<div class="topbar">
    <a class="brand" href="#inicio">${brand}</a>
    <div class="pulse"></div>
    ${lamp(false)}
  </div>`;
}

function chromeA11y() {
  return `<div class="a11y-bar">
    <a class="skip" href="#contenido">Saltar al contenido</a>
    <div class="header-actions">
      <button class="btn ghost" type="button" data-action="listen" style="min-height:56px">Escuchar</button>
      ${lamp(true)}
      <button class="btn ghost" type="button" data-action="a11y">Vista estándar</button>
    </div>
  </div>`;
}

function alertBox() {
  if (state.error) return `<div class="alert" role="alert">${esc(state.error)}</div>`;
  if (state.notice) return `<div class="alert notice" role="status">${esc(state.notice)}</div>`;
  return "";
}

function renderInicio() {
  const a11y = state.set === "a11y";
  if (a11y) {
    return `
      ${chromeA11y()}
      <div class="main" id="contenido">
        ${state.device === "web" ? `<div class="header">${lockup()}<div class="header-actions">${authButtons()}</div></div>` : ""}
        <h1 class="display">Analizá el consumo de tu casa, con texto grande.</h1>
        <p>Completá los datos de tu factura. Sin cuenta ves tu categoría, costo y recomendaciones. Con cuenta se guarda el historial.</p>
        ${alertBox()}
        <div class="cta-row">
          <button class="btn primary" type="button" data-go="analisis">Empezar el análisis</button>
          ${state.auth ? `<button class="btn navy" type="button" data-go="historial">Ver historial</button>`
            : `<button class="btn navy" type="button" data-action="login" data-next="#historial">Entrar para el historial</button>`}
        </div>
      </div>`;
  }
  return `
    ${chromeId()}
    <div class="main">
      ${headerId()}
      <div class="hero">
        <div class="copy">
          <div class="kicker"><span class="dot"></span> RED ENERGÉTICA · IA EN EL HOGAR</div>
          ${state.device === "web" ? bannerBrand() : ""}
          <h1 class="display">Tu casa habla<br>en kilovatios.<br>Nosotros traducimos.</h1>
          <p>Diagnóstico con los datos de tu factura. Categoría, costo, huella de carbono y tres recomendaciones.</p>
          ${alertBox()}
          <div class="cta-row">
            <button class="btn primary" type="button" data-go="analisis">Comenzar análisis</button>
            <span class="caption" style="text-transform:none">${state.auth ? "Sesión activa · podés guardar" : "2 min · sin cuenta, o entrá para historial"}</span>
          </div>
        </div>
        <aside class="meter">
          <div class="caption">Qué ves al terminar</div>
          <p style="color:#fff;margin:0">Tu categoría, costo estimado y 3 acciones para mejorar</p>
          <p class="caption" style="color:#c7cbd1;text-transform:none">Con cuenta: historial y desglose detallado.</p>
        </aside>
      </div>
      ${state.device === "web" ? `
        <div class="bento">
          <article class="card"><div class="stripe"></div><h2>Sin cuenta</h2><p>Analizá tu consumo al instante. Ves tu categoría, costo y tres recomendaciones.</p></article>
          <article class="card"><div class="stripe"></div><h2>Con cuenta</h2><p>Guardá tus análisis y seguí tu evolución mes a mes.</p></article>
          <article class="card"><div class="stripe"></div><h2>Recomendaciones</h2><p>Tres acciones concretas para reducir tu consumo.</p></article>
        </div>
        <div class="foot">${bannerBrand("sm")}<span>© 2026 EnergiAI</span></div>
      ` : ""}
    </div>`;
}

function tile(tipo) {
  const on = state.form.tipo_inmueble === tipo ? " on" : "";
  return `<button class="tile${on}" type="button" data-tipo="${tipo}">
    <div class="caption">Tipo de inmueble</div><h3>${tipo}</h3>
  </button>`;
}

function wizardBody(step) {
  const f = state.form;
  switch (step.key) {
    case "tipo_inmueble":
      return `<div class="stack">${tile("Casa")}${tile("Departamento")}${tile("Monoambiente")}</div>`;
    case "month":
      return `<div class="stack">${MESES.slice(1).map((m, i) =>
        `<button class="choice${String(i + 1) === String(f.month) ? " on" : ""}" type="button" data-field="month" data-value="${i + 1}">${m}</button>`).join("")}</div>`;
    case "uso_horario_pico":
      return `<div class="stack">
        <button class="choice${f.uso_horario_pico === "si" ? " on" : ""}" type="button" data-field="uso_horario_pico" data-value="si">Sí</button>
        <button class="choice${f.uso_horario_pico === "no" ? " on" : ""}" type="button" data-field="uso_horario_pico" data-value="no">No</button>
      </div>`;
    case "horas_alto_consumo":
      return `<div class="field-ctl"><label for="horas_alto_consumo">Horas (0–24)</label>
        <input id="horas_alto_consumo" name="horas_alto_consumo" type="number" min="0" max="24" step="0.5" value="${esc(f.horas_alto_consumo)}"></div>`;
    case "cantidad_equipos":
      return `<div class="field-ctl"><label for="cantidad_equipos">Equipos (0–50)</label>
        <input id="cantidad_equipos" name="cantidad_equipos" type="number" min="0" max="50" step="1" value="${esc(f.cantidad_equipos)}"></div>`;
    case "consumo_mensual":
      return `<div class="field-ctl"><label for="consumo_mensual">kWh (80–1200)</label>
        <input id="consumo_mensual" name="consumo_mensual" type="number" min="80" max="1200" step="1" value="${esc(f.consumo_mensual)}"></div>`;
    case "numero_personas":
      return `<div class="field-ctl"><label for="numero_personas">Personas</label>
        <input id="numero_personas" name="numero_personas" type="number" min="1" step="1" value="${esc(f.numero_personas)}"></div>`;
    case "tarifa_electrica":
      return `<div class="field-ctl"><label for="tarifa_electrica">Tarifa</label>
        <input id="tarifa_electrica" name="tarifa_electrica" type="number" min="0" step="0.01" value="${esc(f.tarifa_electrica)}"></div>`;
    case "antiguedad_electrodomesticos":
      return `<div class="stack">
        <button class="choice${!f.antiguedad_electrodomesticos ? " on" : ""}" type="button" data-field="antiguedad_electrodomesticos" data-value="">Prefiero no decirlo</button>
        ${ANTIGUEDADES.map((a) => `<button class="choice${a === f.antiguedad_electrodomesticos ? " on" : ""}" type="button" data-field="antiguedad_electrodomesticos" data-value="${esc(a)}">${esc(a)}</button>`).join("")}
        <p>Si lo indicás, estimamos un indicador de huella (kg CO2e). Si preferís no decirlo, el resto del diagnóstico sigue igual.</p>
      </div>`;
    case "flags":
      return `<div class="checks">
        <label class="check"><input type="checkbox" name="tiene_calentador"${f.tiene_calentador ? " checked" : ""}> Calentador / calefacción eléctrica</label>
        <label class="check"><input type="checkbox" name="tiene_aire_acondicionado"${f.tiene_aire_acondicionado ? " checked" : ""}> Aire acondicionado</label>
        <label class="check"><input type="checkbox" name="tiene_iluminacion_led"${f.tiene_iluminacion_led ? " checked" : ""}> Iluminación LED</label>
        ${state.auth ? `<label class="check"><input type="checkbox" name="guardar"${f.guardar ? " checked" : ""}> Guardar en historial</label>` : ""}
      </div>`;
    default:
      return "";
  }
}

function renderAnalisisWizard() {
  const i = Math.min(state.wizardStep, WIZARD.length - 1);
  const step = WIZARD[i];
  const last = i === WIZARD.length - 1;
  const dots = WIZARD.map((_, n) => `<i class="${n <= i ? "on" : ""}"></i>`).join("");
  return `
    ${chromeA11y()}
    <div class="main" id="contenido">
      <p class="caption">Paso ${i + 1} de ${WIZARD.length}</p>
      <div class="progress" aria-hidden="true">${dots}</div>
      <h1>${esc(step.title)}</h1>
      ${alertBox()}
      ${wizardBody(step)}
      <div class="cta-row">
        ${i > 0 ? `<button class="btn ghost" type="button" data-action="wizard-back">Anterior</button>` : ""}
        ${last
          ? `<button class="btn navy" type="button" data-action="analizar" ${state.loading ? "disabled" : ""}>${state.loading ? "Calculando…" : "Calcular perfil"}</button>`
          : `<button class="btn navy" type="button" data-action="wizard-next">Siguiente</button>`}
      </div>
    </div>`;
}

function renderAnalisis() {
  if (state.set === "a11y") return renderAnalisisWizard();
  const f = state.form;
  const logged = Boolean(state.auth);
  const a11y = state.set === "a11y";
  return `
    ${a11y ? chromeA11y() : chromeId()}
    <div class="main" id="contenido">
      ${a11y ? "" : headerId()}
      <h1>Armá el pulso de tu hogar</h1>
      <p>Completá los datos de tu factura. ${logged ? "Tu análisis se guardará en el historial." : "Sin cuenta, el resultado no se guarda."}</p>
      ${alertBox()}
      <div class="tiles">
        ${tile("Casa")}${tile("Departamento")}${tile("Monoambiente")}
      </div>
      <div class="fields">
        <div class="field-ctl"><label for="month">Mes de la factura</label>
          <select id="month" name="month" required>
            <option value=""${!f.month ? " selected" : ""} disabled>Seleccioná el mes</option>
            ${MESES.slice(1).map((m, i) =>
            `<option value="${i + 1}"${String(i + 1) === String(f.month) ? " selected" : ""}>${m}</option>`).join("")}</select>
        </div>
        <div class="field-ctl"><label for="uso_horario_pico">¿Usás horario pico?</label>
          <select id="uso_horario_pico" name="uso_horario_pico" required>
            <option value=""${!f.uso_horario_pico ? " selected" : ""} disabled>Seleccioná</option>
            <option value="no"${f.uso_horario_pico === "no" ? " selected" : ""}>No</option>
            <option value="si"${f.uso_horario_pico === "si" ? " selected" : ""}>Sí</option>
          </select>
        </div>
        <div class="field-ctl"><label for="horas_alto_consumo">Horas de alto consumo por día</label>
          <input id="horas_alto_consumo" name="horas_alto_consumo" type="number" min="0" max="24" step="0.5" value="${esc(f.horas_alto_consumo)}" placeholder="Ej: 6" required>
        </div>
        <div class="field-ctl"><label for="cantidad_equipos">Cantidad de equipos eléctricos</label>
          <input id="cantidad_equipos" name="cantidad_equipos" type="number" min="0" max="50" step="1" value="${esc(f.cantidad_equipos)}" placeholder="Ej: 8" required>
        </div>
        <div class="field-ctl"><label for="consumo_mensual">Consumo mensual en kWh</label>
          <input id="consumo_mensual" name="consumo_mensual" type="number" min="80" max="1200" step="1" value="${esc(f.consumo_mensual)}" placeholder="Según tu factura (80-1200)" required>
        </div>
        <div class="field-ctl"><label for="numero_personas">Personas en el hogar (opcional)</label>
          <input id="numero_personas" name="numero_personas" type="number" min="1" step="1" value="${esc(f.numero_personas)}" placeholder="Opcional">
        </div>
        <div class="field-ctl"><label for="tarifa_electrica">Tarifa por kWh (opcional)</label>
          <input id="tarifa_electrica" name="tarifa_electrica" type="number" min="0" step="0.01" value="${esc(f.tarifa_electrica)}" placeholder="Ej: 0.75">
        </div>
        <div class="field-ctl"><label for="antiguedad_electrodomesticos">Antigüedad de equipos (opcional)</label>
          <select id="antiguedad_electrodomesticos" name="antiguedad_electrodomesticos">
            <option value=""${!f.antiguedad_electrodomesticos ? " selected" : ""}>No especificar</option>
            ${ANTIGUEDADES.map((a) => `<option${a === f.antiguedad_electrodomesticos ? " selected" : ""}>${a}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="checks">
        <label class="check"><input type="checkbox" name="tiene_calentador"${f.tiene_calentador ? " checked" : ""}> Calentador / calefacción eléctrica</label>
        <label class="check"><input type="checkbox" name="tiene_aire_acondicionado"${f.tiene_aire_acondicionado ? " checked" : ""}> Aire acondicionado</label>
        <label class="check"><input type="checkbox" name="tiene_iluminacion_led"${f.tiene_iluminacion_led ? " checked" : ""}> Iluminación LED</label>
        ${logged ? `<label class="check"><input type="checkbox" name="guardar"${f.guardar ? " checked" : ""}> Guardar en historial</label>`
          : `<p class="caption" style="text-transform:none">Para guardar: <button class="link" type="button" data-action="login" data-next="#analisis">entrar</button>.</p>`}
      </div>
      <div class="cta-row">
        <button class="btn primary" type="button" data-action="analizar" ${state.loading ? "disabled" : ""}>
          ${state.loading ? "Calculando…" : "Calcular perfil"}
        </button>
      </div>
    </div>`;
}

function recsHtml(lista) {
  const items = (lista && lista.length ? lista : ["Sin recomendaciones en este registro."]).slice(0, 3);
  return items.map((t, i) => `
    <div class="rec">
      <span class="n">${String(i + 1).padStart(2, "0")}</span>
      <div><p style="color:inherit">${esc(t)}</p></div>
    </div>`).join("");
}

function cifra(label, val) {
  if (val == null || val === "") return "";
  return `<div class="field"><div class="caption">${esc(label)}</div><div class="val">${esc(val)}</div></div>`;
}

function pctLabel(x) {
  if (x == null || x === "") return null;
  return `${(Number(x) * 100).toFixed(0)} %`;
}

function probabilidadDe(result) {
  if (!result) return null;
  const scalar = pick(result, "probabilidad");
  if (scalar != null && typeof scalar !== "object") return scalar;
  const map = pick(result, "probabilidades");
  if (!map || typeof map !== "object") return null;
  const cat = result.categoria;
  const keys = [cat, etiquetaCat(cat), String(cat || "").toUpperCase(), String(cat || "")];
  for (const k of keys) {
    if (k && map[k] != null) return map[k];
  }
  return null;
}

function costosHtml(costos, resumen, result) {
  const c = costos || {};
  const r = resumen || {};
  const iie = result ? pick(result, "indiceEficiencia", "indice_eficiencia") : null;
  const prob = probabilidadDe(result);
  const bench = c.benchmark || {};
  const proy = c.proyeccion_estacional || c.proyeccionEstacional || [];
  const filas = [
    cifra("Costo base", c.costo_bruto_mensual != null ? `${fmtMoney(c.costo_bruto_mensual)} USD` : null),
    cifra("Costo con recargos", c.costo_ajustado_mensual != null ? `${fmtMoney(c.costo_ajustado_mensual)} USD` : null),
    cifra("Estación", c.estacion),
    cifra("Recargo estacional", pctLabel(c.pct_estacional)),
    cifra("Recargo horario pico", pctLabel(c.pct_horario_pico)),
    cifra("Recargo sin LED", pctLabel(c.pct_sin_led)),
    cifra("Recargo equipos antiguos", pctLabel(c.pct_antiguedad)),
    cifra("Ahorro posible / mes", c.ahorro_potencial_mensual != null ? `${fmtMoney(c.ahorro_potencial_mensual)} USD` : null),
    cifra("Ahorro posible / año", c.ahorro_potencial_anual != null ? `${fmtMoney(c.ahorro_potencial_anual)} USD` : null),
    cifra("Consumo por persona", iie != null ? `${fmt(iie, 1)} kWh` : null),
    cifra("Comparación", bench.posicion_rango || bench.posicionRango),
    cifra("Tendencia", r.tendencia),
    cifra("Análisis previos", r.analisis_previos != null ? r.analisis_previos : null),
    cifra("Promedio anterior", r.consumo_promedio_kwh != null ? `${fmt(r.consumo_promedio_kwh, 0)} kWh` : null)
  ].join("");
  const proj = Array.isArray(proy) && proy.length
    ? `<div class="stack"><h2 style="margin:0;color:inherit">Proyección por estación</h2><div class="costos-grid">${proy.map((p) =>
        cifra(p.estacion + (p.es_estacion_actual || p.esEstacionActual ? " (actual)" : ""),
          fmtMoney(pick(p, "costo_mensual_estimado", "costoMensualEstimado")) + " USD")).join("")}</div></div>`
    : "";
  if (!filas.replace(/\s/g, "") && !proj) {
    return `<p>Entrá con tu cuenta para ver el desglose de costos y tu historial.</p>`;
  }
  return `<div class="costos-grid">${filas}</div>${proj}`;
}

function renderResultados() {
  const a11y = state.set === "a11y";
  const r = state.result;
  if (!r) {
    return `
      ${a11y ? chromeA11y() : chromeId()}
      <div class="main" id="contenido">
        ${headerId()}
        <h1>Todavía no hay un resultado</h1>
        <p>Completá un análisis o abrí una barra del historial.</p>
        <div class="cta-row">
          <button class="btn primary" type="button" data-go="analisis">Ir al análisis</button>
          <button class="btn ghost" type="button" data-go="historial">Historial</button>
        </div>
      </div>`;
  }
  const cat = etiquetaCat(r.categoria);
  const costo = pick(r, "costoEstimadoMensual", "costo_estimado_mensual");
  const huella = pick(r, "huella_carbono_kg_co2e_mes", "huellaCarbonoKgCo2eMes");
  const recs = pick(r, "recomendaciones") || [];
  const costos = pick(r, "costos");
  const resumen = pick(r, "historial_resumen", "historialResumen");
  const consumo = pick(r, "consumoMensual", "consumo_mensual")
    || pick(r.consulta_modelo || {}, "consumo_mensual")
    || state.form.consumo_mensual;
  return `
    ${a11y ? chromeA11y() : chromeId()}
    <div class="main" id="contenido">
      ${a11y ? "" : headerId()}
      ${alertBox()}
      <div class="split">
        <div class="stamp">
          ${hatch(state.device === "mobile" ? 8 : 12)}
          <div class="caption" style="color:var(--green)">Tu perfil de consumo</div>
          <h1 class="display" style="color:inherit">${esc(cat)}</h1>
          <h2 style="margin:0;color:var(--green);font-size:28px">${fmtMoney(costo)} USD / mes</h2>
          <p style="color:inherit">${fmt(consumo, 0)} kWh${huella != null
            ? ` · ${fmt(huella, 1)} kg CO₂`
            : ""}</p>
        </div>
        <div class="stack">
          <h2 style="margin:0;color:inherit">Tres acciones sugeridas</h2>
          ${recsHtml(recs)}
        </div>
      </div>
      ${costosHtml(costos, resumen, r)}
      ${state.auth && state.historial.length ? `<h2 style="margin:0;color:inherit">Tu historial</h2>${chartHistorial(state.historial)}` : ""}
      <div class="cta-row">
        <button class="btn primary" type="button" data-go="analisis">Otro análisis</button>
        ${!state.auth ? `<button class="btn navy" type="button" data-action="login" data-next="#resultados">Entra para guardar</button>` : ""}
        ${state.auth && r.guardado === false ? `<button class="btn navy" type="button" data-action="guardar">Guardar en historial</button>` : ""}
        <button class="btn ghost" type="button" data-go="historial">Ver historial</button>
      </div>
    </div>`;
}

function labelMesItem(item) {
  const n = mesNumero(pick(item, "mes", "month"));
  const creado = pick(item, "creadoEn", "creado_en");
  const y = creado ? new Date(creado).getFullYear() : "";
  const corto = n ? MESES[n].slice(0, 3) : "?";
  return y ? `${corto} ${String(y).slice(2)}` : corto;
}

function chartHistorial(items) {
  if (!items.length) return "<p>No hay análisis guardados todavía.</p>";
  const ordered = [...items].reverse();
  const kwhs = ordered.map((it) => Number(pick(it, "consumoMensual", "consumo_mensual")) || 0);
  const co2s = ordered.map((it) => {
    const v = pick(it, "huella_carbono_kg_co2e_mes", "huellaCarbonoKgCo2eMes");
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  });
  const conHuella = co2s.filter((v) => v != null);
  const maxK = Math.max(...kwhs, 1);
  const maxC = conHuella.length ? Math.max(...conHuella, 1) : 1;
  const left = 48, right = conHuella.length ? 52 : 16, top = 12, bottom = 36, plotH = 180;
  const gw = 40;
  const plotW = Math.max(ordered.length * gw, 320);
  const w = left + plotW + right;
  const h = top + plotH + bottom;
  const ticks = 4;
  let yLabels = "";
  for (let t = 0; t <= ticks; t++) {
    const frac = t / ticks;
    const y = top + plotH - frac * plotH;
    yLabels += `<text class="chart-axis" x="4" y="${y + 4}">${Math.round(maxK * frac)}</text>`;
    if (conHuella.length) {
      yLabels += `<text class="chart-axis" x="${w - 4}" y="${y + 4}" text-anchor="end">${Math.round(maxC * frac)}</text>`;
    }
  }
  const groups = ordered.map((it, i) => {
    const x = left + i * gw + 6;
    const hk = (kwhs[i] / maxK) * plotH;
    const id = pick(it, "id");
    const kg = co2s[i];
    const title = kg == null
      ? `${labelMesItem(it)}: ${fmt(kwhs[i], 0)} kWh`
      : `${labelMesItem(it)}: ${fmt(kwhs[i], 0)} kWh, ${fmt(kg, 1)} kg CO₂`;
    const barraCo2 = kg == null ? ""
      : `<rect class="bar-co2" x="${x + 14}" y="${top + plotH - (kg / maxC) * plotH}" width="12" height="${Math.max((kg / maxC) * plotH, 2)}" rx="3"></rect>`;
    return `<g class="bar-group" tabindex="0" role="button" data-analisis-id="${id}" aria-label="${esc(title)}">
      <title>${esc(title)}</title>
      <rect class="bar-kwh" x="${x}" y="${top + plotH - hk}" width="12" height="${Math.max(hk, 2)}" rx="3"></rect>
      ${barraCo2}
      <text class="chart-axis" x="${x + 12}" y="${h - 8}" text-anchor="middle">${esc(labelMesItem(it))}</text>
    </g>`;
  }).join("");
  return `
    <div class="chart-legend">
      <span><i class="kwh"></i>Consumo</span>
      ${conHuella.length ? `<span><i class="co2"></i>Huella de carbono</span>` : ""}
    </div>
    <div class="chart-wrap">
      <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Historial de consumo">
        ${yLabels}${groups}
      </svg>
    </div>`;
}

function renderHistorial() {
  const a11y = state.set === "a11y";
  if (!state.auth) {
    return `
      ${a11y ? chromeA11y() : chromeId()}
      <div class="main" id="contenido">
        ${headerId()}
        <h1>Historial</h1>
        <p>Entrá con tu cuenta para ver tus análisis guardados.</p>
        ${alertBox()}
        <div class="cta-row">
          <button class="btn primary" type="button" data-action="login" data-next="#historial">Entrar</button>
          ${state.result ? `<button class="btn ghost" type="button" data-go="resultados">Volver a resultados</button>` : `<button class="btn ghost" type="button" data-go="analisis">Ir al análisis</button>`}
        </div>
      </div>`;
  }
  return `
    ${a11y ? chromeA11y() : chromeId()}
    <div class="main" id="contenido">
      ${headerId()}
      <h1>Tu historial</h1>
      <p>Tus análisis guardados. Tocá una barra para ver el detalle.</p>
      ${alertBox()}
      ${state.loading ? "<p>Cargando…</p>" : chartHistorial(state.historial)}
    </div>`;
}

function renderEntrar() {
  const a11y = state.set === "a11y";
  const registro = state.loginTab === "registro";
  return `
    ${a11y ? chromeA11y() : chromeId()}
    <div class="main" id="contenido">
      ${a11y ? "" : headerId()}
      <h1>${registro ? "Creá tu cuenta." : "Tu casa, en claro."}</h1>
      <p>Entrá para ver el historial y guardar análisis. El diagnóstico que ya calculaste no se pierde.</p>
      ${alertBox()}
      <div class="auth-tabs">
        <button class="btn ${registro ? "ghost" : "navy"}" type="button" data-action="login">Entrar</button>
        <button class="btn ${registro ? "navy" : "ghost"}" type="button" data-action="registro">Crear cuenta</button>
      </div>
      ${registro ? `
        <form id="formRegistro" class="stack">
          <div class="field-ctl"><label for="regNombre">Nombre</label>
            <input id="regNombre" name="nombre" type="text" autocomplete="name"></div>
          <div class="field-ctl"><label for="regEmail">Email</label>
            <input id="regEmail" name="email" type="email" autocomplete="username" required></div>
          <div class="field-ctl"><label for="regPassword">Contraseña (mínimo 8)</label>
            <input id="regPassword" name="password" type="password" autocomplete="new-password" minlength="8" required></div>
          <button class="btn primary" type="submit">${state.loading ? "Creando…" : "Crear cuenta"}</button>
        </form>` : `
        <form id="formLogin" class="stack">
          <div class="field-ctl"><label for="loginEmail">Email</label>
            <input id="loginEmail" name="email" type="email" autocomplete="username" required></div>
          <div class="field-ctl"><label for="loginPassword">Contraseña</label>
            <input id="loginPassword" name="password" type="password" autocomplete="current-password" required></div>
          <button class="btn primary" type="submit"${state.loading ? " disabled" : ""}>${state.loading ? "Entrando…" : "Entrar"}</button>
        </form>`}
      <button class="btn google" type="button" data-action="google">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true" width="18" height="18">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continuar con Google
      </button>
    </div>`;
}

const RENDER = {
  inicio: renderInicio,
  analisis: renderAnalisis,
  resultados: renderResultados,
  historial: renderHistorial,
  entrar: renderEntrar
};

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyChrome() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.set = state.set;
  const device = $("#app .device");
  if (!device) return;
  device.dataset.theme = state.theme;
  device.dataset.set = state.set;
  device.dataset.device = state.device;
}

function render() {
  const root = $("#app");
  const html = (RENDER[state.screen] || renderInicio)();
  const a11y = state.set === "a11y";
  root.innerHTML = `<div class="device" data-device="${state.device}" data-set="${state.set}" data-theme="${state.theme}"><div class="shell ${state.device === "web" && !a11y ? "" : "stack"}" style="${state.device !== "web" || a11y ? "flex-direction:column" : ""}">${html}</div></div>`;
  applyChrome();
  bindForm();
}

function bindForm() {
  const main = $(".main") || document;
  main.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("change", () => {
      const name = el.name;
      if (!name) return;
      if (el.type === "checkbox") state.form[name] = el.checked;
      else state.form[name] = el.value;
    });
  });
  const formLogin = $("#formLogin");
  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      enviarAuth("/api/auth/login", {
        email: $("#loginEmail").value.trim(),
        password: $("#loginPassword").value
      });
    });
  }
  const formRegistro = $("#formRegistro");
  if (formRegistro) {
    formRegistro.addEventListener("submit", (e) => {
      e.preventDefault();
      enviarAuth("/api/auth/registro", {
        email: $("#regEmail").value.trim(),
        password: $("#regPassword").value,
        nombre: $("#regNombre").value.trim() || undefined
      });
    });
  }
}

function syncFormFromDom() {
  document.querySelectorAll(".main input[name], .main select[name]").forEach((el) => {
    if (el.type === "checkbox") state.form[el.name] = el.checked;
    else state.form[el.name] = el.value;
  });
}

function parseHash() {
  const raw = (location.hash || "#inicio").replace(/^#/, "");
  const [screen, id] = raw.split("/");
  if (["inicio", "analisis", "resultados", "historial", "entrar"].includes(screen)) {
    state.screen = screen;
    state.detalleId = id || null;
    if (screen === "entrar") state.loginTab = id === "registro" ? "registro" : "login";
  } else {
    state.screen = "inicio";
    state.detalleId = null;
  }
}

function go(screen) {
  const next = "#" + screen;
  if (location.hash === next) {
    parseHash();
    render();
    return;
  }
  location.hash = screen;
}

function speak() {
  const map = {
    inicio: "EnergiAI. Analizá el consumo de tu casa. Podés empezar sin cuenta.",
    analisis: "Completá los datos de la factura y calculá el perfil.",
    resultados: state.result ? `Categoría ${etiquetaCat(state.result.categoria)}.` : "Todavía no hay un resultado.",
    entrar: "Entrá para ver el historial o guardar el análisis.",
  };
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(map[state.screen] || "");
  u.lang = "es";
  window.speechSynthesis.speak(u);
}

function expireSession() {
  localStorage.removeItem(KEYS.token);
  localStorage.removeItem(KEYS.email);
  localStorage.removeItem(KEYS.nombre);
  state.auth = null;
  state.historial = [];
}

function logout() {
  expireSession();
  // Limpiar también sessionStorage
  sessionStorage.removeItem(KEYS.form);
  sessionStorage.removeItem(KEYS.result);
  sessionStorage.removeItem(KEYS.next);
  // Resetear estado
  state.form = defaultForm();
  state.result = null;
  state.historial = [];
  state.notice = null;
  go("inicio");
}

function facturaPayload() {
  const f = state.form;
  const body = {
    consumo_mensual: Number(f.consumo_mensual),
    uso_horario_pico: f.uso_horario_pico,
    cantidad_equipos: Number(f.cantidad_equipos),
    tipo_inmueble: f.tipo_inmueble,
    horas_alto_consumo: Number(f.horas_alto_consumo),
    month: String(f.month),
    tiene_aire_acondicionado: Boolean(f.tiene_aire_acondicionado),
    tiene_calentador: Boolean(f.tiene_calentador),
    tiene_iluminacion_led: Boolean(f.tiene_iluminacion_led)
  };
  if (f.numero_personas) body.numero_personas = Number(f.numero_personas);
  if (f.antiguedad_electrodomesticos) body.antiguedad_electrodomesticos = f.antiguedad_electrodomesticos;
  if (f.tarifa_electrica !== "" && f.tarifa_electrica != null) body.tarifa_electrica = Number(f.tarifa_electrica);
  return body;
}

async function api(path, opts = {}) {
  const url = API_BASE + path;
  const headers = { Accept: "application/json" };
  if (opts.body) headers["Content-Type"] = "application/json";
  if (state.auth?.token && opts.auth !== false) {
    headers.Authorization = "Bearer " + state.auth.token;
  }
  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    credentials: API_BASE ? "include" : "same-origin",
    cache: "no-store",
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    const err = new Error(data.message || "Sesión requerida");
    err.status = 401;
    throw err;
  }
  if (!res.ok) {
    const fields = data.fieldErrors
      ? Object.entries(data.fieldErrors).map(([k, v]) => `${k}: ${v}`).join(" · ")
      : "";
    throw new Error([data.message, fields].filter(Boolean).join(" — ") || `Error ${res.status}`);
  }
  return data;
}

async function enviarAuth(path, payload) {
  state.error = null;
  state.notice = null;
  state.loading = true;
  render();
  try {
    const body = await api(path, { method: "POST", body: payload, auth: false });
    if (!body.token) throw new Error("El servidor no devolvió un token.");
    applyAuth(body.token, body.email, body.nombre);
    state.loading = false;
    const next = sessionStorage.getItem(KEYS.next) || "/index.html#inicio";
    let hash = next.includes("#") ? next.slice(next.indexOf("#") + 1) : "inicio";
    if (!hash || hash.startsWith("entrar")) hash = "inicio";
    go(hash);
  } catch (err) {
    state.loading = false;
    state.error = err.message;
    render();
  }
}

async function probeSession() {
  try {
    const me = await api("/api/auth/sesion");
    if (me.email) {
      applyAuth(me.token || state.auth?.token, me.email, me.nombre);
    }
  } catch (err) {
    if (err.status === 401 && state.auth?.token) expireSession();
  }
}

function ingestOAuthHash() {
  const raw = (location.hash || "").replace(/^#/, "");
  if (!raw.includes("token=")) return;
  const params = new URLSearchParams(raw);
  const token = params.get("token");
  if (!token) return;
  applyAuth(token, params.get("email") || "", params.get("nombre") || "");
  let next = sessionStorage.getItem(KEYS.next) || "/index.html#inicio";
  if (next.includes("#entrar")) next = "/index.html#inicio";
  const hash = next.includes("#") ? next.slice(next.indexOf("#")) : "#inicio";
  history.replaceState(null, "", location.pathname + location.search + hash);
}

async function postAnalisis(guardar) {
  return api("/api/analisis", {
    method: "POST",
    body: { factura: facturaPayload(), guardar }
  });
}

function validateForm() {
  const f = state.form;
  const errors = [];
  
  if (!f.tipo_inmueble) errors.push("Seleccioná el tipo de vivienda");
  if (!f.month) errors.push("Seleccioná el mes de la factura");
  if (!f.uso_horario_pico) errors.push("Indicá si usás horario pico");
  if (f.horas_alto_consumo === "" || f.horas_alto_consumo === null) errors.push("Ingresá las horas de alto consumo");
  if (f.cantidad_equipos === "" || f.cantidad_equipos === null) errors.push("Ingresá la cantidad de equipos");
  if (f.consumo_mensual === "" || f.consumo_mensual === null) errors.push("Ingresá el consumo mensual");
  
  const consumo = Number(f.consumo_mensual);
  if (f.consumo_mensual !== "" && f.consumo_mensual !== null && (consumo < 80 || consumo > 1200)) {
    errors.push("El consumo debe estar entre 80 y 1200 kWh");
  }
  
  return errors;
}

async function analizar() {
  syncFormFromDom();
  
  // Validar antes de enviar
  const errors = validateForm();
  if (errors.length > 0) {
    state.error = errors.join(". ") + ".";
    render();
    return;
  }
  
  state.error = null;
  state.notice = null;
  state.loading = true;
  render();
  try {
    const quiereGuardar = Boolean(state.auth && state.form.guardar);
    let data;
    try {
      data = await postAnalisis(quiereGuardar);
    } catch (err) {
      if (err.status === 401 && quiereGuardar) {
        expireSession();
        data = await postAnalisis(false);
        state.notice = "La sesión no era válida. Calculamos el perfil sin guardarlo. Entrá de nuevo para persistirlo.";
      } else {
        throw err;
      }
    }
    state.result = sanitizeResult(data);
    persistSession();
    state.loading = false;
    if (state.auth) {
      try { state.historial = await api("/api/historial"); } catch (_) { /* */ }
    }
    go("resultados");
  } catch (err) {
    state.loading = false;
    state.error = err.message;
    render();
  }
}

async function guardarAnalisis() {
  if (!state.auth) {
    queueLogin("login", "#resultados");
    return;
  }
  syncFormFromDom();
  state.form.guardar = true;
  state.error = null;
  state.notice = null;
  state.loading = true;
  render();
  try {
    const data = await api("/api/analisis", {
      method: "POST",
      body: { factura: facturaPayload(), guardar: true }
    });
    state.result = sanitizeResult(data);
    persistSession();
    state.historial = await api("/api/historial").catch(() => state.historial);
    state.loading = false;
    go("resultados");
  } catch (err) {
    state.loading = false;
    if (err.status === 401) {
      expireSession();
      state.notice = "La sesión no era válida. El resultado sigue acá; entrá de nuevo para guardarlo.";
    } else {
      state.error = err.message;
    }
    render();
  }
}

async function cargarHistorial() {
  if (!state.auth) {
    render();
    return;
  }
  state.loading = true;
  state.error = null;
  render();
  try {
    state.historial = await api("/api/historial");
    if (state.detalleId) {
      const det = await api("/api/historial/" + state.detalleId);
      state.result = sanitizeResult(det);
      persistSession();
      state.loading = false;
      go("resultados");
      return;
    }
    state.loading = false;
    render();
  } catch (err) {
    state.loading = false;
    if (err.status === 401) {
      expireSession();
      state.notice = "La sesión no era válida. Entrá de nuevo para ver el historial; el análisis actual sigue en Resultados.";
    } else {
      state.error = err.message;
    }
    render();
  }
}

async function abrirDetalle(id) {
  state.error = null;
  state.loading = true;
  render();
  try {
    state.result = sanitizeResult(await api("/api/historial/" + id));
    persistSession();
    state.detalleId = id;
    state.loading = false;
    go("resultados");
  } catch (err) {
    state.loading = false;
    if (err.status === 401) {
      expireSession();
      state.notice = "La sesión no era válida. Entrá de nuevo para abrir el detalle; el análisis actual sigue en Resultados.";
    } else {
      state.error = err.message;
    }
    render();
  }
}

async function onRoute() {
  parseHash();
  state.device = deviceDe();
  state.error = null;
  const oauthErr = sessionStorage.getItem(KEYS.authError);
  if (oauthErr) {
    state.error = oauthErr;
    sessionStorage.removeItem(KEYS.authError);
  }
  if (state.screen === "historial") {
    await cargarHistorial();
    return;
  }
  if (state.screen === "resultados" && state.auth && !state.historial.length) {
    try { state.historial = await api("/api/historial"); } catch (err) {
      if (err.status === 401) {
        expireSession();
        state.notice = "La sesión no era válida. El resultado sigue acá; entrá de nuevo para ver el historial.";
      }
    }
  }
  render();
}

document.addEventListener("DOMContentLoaded", async () => {
  ingestOAuthHash();
  await probeSession();
  onRoute();
  window.addEventListener("hashchange", () => { onRoute(); });
  window.addEventListener("resize", () => {
    const d = deviceDe();
    if (d !== state.device) { state.device = d; render(); }
  });
  document.body.addEventListener("click", (e) => {
    const grupo = e.target.closest("[data-analisis-id]");
    if (grupo) {
      abrirDetalle(grupo.getAttribute("data-analisis-id"));
      return;
    }
    const tipoBtn = e.target.closest("[data-tipo]");
    if (tipoBtn) {
      state.form.tipo_inmueble = tipoBtn.getAttribute("data-tipo");
      render();
      return;
    }
    const fieldBtn = e.target.closest("[data-field]");
    if (fieldBtn) {
      state.form[fieldBtn.getAttribute("data-field")] = fieldBtn.getAttribute("data-value");
      render();
      return;
    }
    const btn = e.target.closest("[data-action], [data-go]");
    if (!btn) return;
    if (btn.dataset.action === "theme") {
      state.theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem(KEYS.theme, state.theme);
      render();
    }
    if (btn.dataset.action === "a11y") {
      state.set = state.set === "a11y" ? "id" : "a11y";
      localStorage.setItem(KEYS.set, state.set);
      state.wizardStep = 0;
      render();
    }
    if (btn.dataset.action === "listen") speak();
    if (btn.dataset.action === "logout") logout();
    if (btn.dataset.action === "analizar") analizar();
    if (btn.dataset.action === "guardar") guardarAnalisis();
    if (btn.dataset.action === "login") {
      if (state.screen === "entrar") {
        state.loginTab = "login";
        go("entrar");
      } else {
        queueLogin("login", btn.dataset.next);
      }
      return;
    }
    if (btn.dataset.action === "registro") {
      if (state.screen === "entrar") {
        state.loginTab = "registro";
        go("entrar/registro");
      } else {
        queueLogin("registro", btn.dataset.next);
      }
      return;
    }
    if (btn.dataset.action === "google") {
      e.preventDefault();
      let next = sessionStorage.getItem(KEYS.next) || ("/index.html" + (location.hash || "#inicio"));
      if (next.includes("#entrar")) next = "/index.html#inicio";
      sessionStorage.setItem(KEYS.next, next);
      empezarGoogle();
      return;
    }
    if (btn.dataset.action === "wizard-next") {
      syncFormFromDom();
      state.wizardStep = Math.min(state.wizardStep + 1, WIZARD.length - 1);
      render();
    }
    if (btn.dataset.action === "wizard-back") {
      syncFormFromDom();
      state.wizardStep = Math.max(state.wizardStep - 1, 0);
      render();
    }
    if (btn.dataset.go) go(btn.dataset.go);
  });
  document.body.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const grupo = e.target.closest("[data-analisis-id]");
    if (!grupo) return;
    e.preventDefault();
    abrirDetalle(grupo.getAttribute("data-analisis-id"));
  });
});
