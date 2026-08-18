/**
 * API y autenticación
 */

import { CONFIG, KEYS } from './config.js';
import { state, applyAuth, expireSession, facturaPayload, persistSession, defaultForm } from './state.js';
import { sanitizeResult, esIpPrivada } from './utils.js';

let _go, _render;
export function setRouter(go, render) {
  _go = go;
  _render = render;
}
function go(screen) { _go?.(screen); }
function render() { _render?.(); }

export async function api(path, opts = {}) {
  const url = CONFIG.API_BASE + path;
  const headers = { Accept: 'application/json' };
  if (opts.body) headers['Content-Type'] = 'application/json';
  if (state.auth?.token && opts.auth !== false) {
    headers.Authorization = 'Bearer ' + state.auth.token;
  }
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers,
    credentials: CONFIG.API_BASE ? 'include' : 'same-origin',
    cache: 'no-store',
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    const err = new Error(data.message || 'Sesión requerida');
    err.status = 401;
    throw err;
  }
  if (!res.ok) {
    const fields = data.fieldErrors
      ? Object.entries(data.fieldErrors).map(([k, v]) => `${k}: ${v}`).join(' · ')
      : '';
    throw new Error([data.message, fields].filter(Boolean).join(' — ') || `Error ${res.status}`);
  }
  return data;
}

export async function probeSession() {
  try {
    const me = await api('/api/auth/sesion');
    if (me.email) {
      applyAuth(me.token || state.auth?.token, me.email, me.nombre);
    }
  } catch (err) {
    if (err.status === 401 && state.auth?.token) expireSession();
  }
}

export function ingestOAuthHash() {
  const raw = (location.hash || '').replace(/^#/, '');
  if (!raw.includes('token=')) return;
  const params = new URLSearchParams(raw);
  const token = params.get('token');
  if (!token) return;
  applyAuth(token, params.get('email') || '', params.get('nombre') || '');
  let next = sessionStorage.getItem(KEYS.next) || '/index.html#inicio';
  if (next.includes('#entrar')) next = '/index.html#inicio';
  const hash = next.includes('#') ? next.slice(next.indexOf('#')) : '#inicio';
  history.replaceState(null, '', location.pathname + location.search + hash);
}

export async function empezarGoogle() {
  if (esIpPrivada()) {
    state.error = 'Google OAuth no está disponible desde IPs de red local. Usá email y contraseña, o accedé desde localhost.';
    if (state.screen !== 'entrar') queueLogin('login');
    else render();
    return;
  }
  try {
    const info = await api('/api/auth/proveedores', { auth: false });
    if (!info.google) {
      state.error = 'Google no está disponible en este entorno. Entrá con email y contraseña.';
      if (state.screen !== 'entrar') queueLogin('login');
      else render();
      return;
    }
  } catch (_) { /* si el probe falla, igual intentamos el flujo del IdP */ }
  location.assign('/oauth2/authorization/google');
}

export async function enviarAuth(path, payload) {
  state.error = null;
  state.notice = null;
  state.loading = true;
  render();
  try {
    const body = await api(path, { method: 'POST', body: payload, auth: false });
    if (!body.token) throw new Error('El servidor no devolvió un token.');
    applyAuth(body.token, body.email, body.nombre);
    state.loading = false;
    const next = sessionStorage.getItem(KEYS.next) || '/index.html#inicio';
    let hash = next.includes('#') ? next.slice(next.indexOf('#') + 1) : 'inicio';
    if (!hash || hash.startsWith('entrar')) hash = 'inicio';
    go(hash);
  } catch (err) {
    state.loading = false;
    state.error = err.message;
    render();
  }
}

async function postAnalisis(guardar) {
  return api('/api/analisis', {
    method: 'POST',
    body: { factura: facturaPayload(), guardar }
  });
}

export async function analizar() {
  syncFormFromDom();
  
  const { validateForm } = await import('./state.js');
  const errors = validateForm();
  if (errors.length > 0) {
    state.error = errors.join('. ') + '.';
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
        state.notice = 'La sesión no era válida. Calculamos el perfil sin guardarlo. Entrá de nuevo para persistirlo.';
      } else {
        throw err;
      }
    }
    state.result = sanitizeResult(data);
    persistSession();
    state.loading = false;
    if (state.auth) {
      try { state.historial = await api('/api/historial'); } catch (_) { /* */ }
    }
    go('resultados');
  } catch (err) {
    state.loading = false;
    state.error = err.message;
    render();
  }
}

export async function guardarAnalisis() {
  if (!state.auth) {
    queueLogin('login', '#resultados');
    return;
  }
  syncFormFromDom();
  state.form.guardar = true;
  state.error = null;
  state.notice = null;
  state.loading = true;
  render();
  try {
    const data = await api('/api/analisis', {
      method: 'POST',
      body: { factura: facturaPayload(), guardar: true }
    });
    state.result = sanitizeResult(data);
    persistSession();
    state.historial = await api('/api/historial').catch(() => state.historial);
    state.loading = false;
    go('resultados');
  } catch (err) {
    state.loading = false;
    if (err.status === 401) {
      expireSession();
      state.notice = 'La sesión no era válida. El resultado sigue acá; entrá de nuevo para guardarlo.';
    } else {
      state.error = err.message;
    }
    render();
  }
}

export async function cargarHistorial() {
  if (!state.auth) {
    render();
    return;
  }
  state.loading = true;
  state.error = null;
  render();
  try {
    state.historial = await api('/api/historial');
    if (state.detalleId) {
      const det = await api('/api/historial/' + state.detalleId);
      state.result = sanitizeResult(det);
      persistSession();
      state.loading = false;
      go('resultados');
      return;
    }
    state.loading = false;
    render();
  } catch (err) {
    state.loading = false;
    if (err.status === 401) {
      expireSession();
      state.notice = 'La sesión no era válida. Entrá de nuevo para ver el historial; el análisis actual sigue en Resultados.';
    } else {
      state.error = err.message;
    }
    render();
  }
}

export async function abrirDetalle(id) {
  state.error = null;
  state.loading = true;
  render();
  try {
    state.result = sanitizeResult(await api('/api/historial/' + id));
    persistSession();
    state.detalleId = id;
    state.loading = false;
    go('resultados');
  } catch (err) {
    state.loading = false;
    if (err.status === 401) {
      expireSession();
      state.notice = 'La sesión no era válida. Entrá de nuevo para abrir el detalle; el análisis actual sigue en Resultados.';
    } else {
      state.error = err.message;
    }
    render();
  }
}

export function queueLogin(tab, nextHash) {
  const next = '/index.html' + (nextHash || location.hash || '#inicio');
  sessionStorage.setItem(KEYS.next, next);
  state.loginTab = tab === 'registro' ? 'registro' : 'login';
  go(tab === 'registro' ? 'entrar/registro' : 'entrar');
}

export function syncFormFromDom() {
  document.querySelectorAll('.main input[name], .main select[name]').forEach((el) => {
    if (el.type === 'checkbox') state.form[el.name] = el.checked;
    else state.form[el.name] = el.value;
  });
}
