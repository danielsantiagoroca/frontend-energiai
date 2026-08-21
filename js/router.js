/**
 * Router y renderizado
 */

import { KEYS } from './config.js';
import { state, restoreSession } from './state.js';
import { $, deviceDe } from './utils.js';
import { api, cargarHistorial, cargarPeriodosOcupados, setRouter } from './api.js';

import { renderInicio } from './views/inicio.js';
import { renderAnalisis } from './views/analisis.js';
import { renderResultados, translateRecommendations } from './views/resultados.js';
import { renderHistorial } from './views/historial.js';
import { renderEntrar } from './views/entrar.js';
import { renderComparar } from './views/comparar.js';

const RENDER = {
  inicio: renderInicio,
  analisis: renderAnalisis,
  resultados: renderResultados,
  historial: renderHistorial,
  entrar: renderEntrar,
  comparar: renderComparar
};

export function parseHash() {
  const raw = (location.hash || '#inicio').replace(/^#/, '');
  const [screen, id] = raw.split('/');
  if (['inicio', 'analisis', 'resultados', 'historial', 'entrar', 'comparar'].includes(screen)) {
    state.screen = screen;
    state.detalleId = id || null;
    if (screen === 'entrar') state.loginTab = id === 'registro' ? 'registro' : 'login';
  } else {
    state.screen = 'inicio';
    state.detalleId = null;
  }
}

export function go(screen) {
  const next = '#' + screen;
  if (location.hash === next) {
    parseHash();
    render();
    return;
  }
  location.hash = screen;
}

function applyChrome() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.set = state.set;
  const device = $('#app .device');
  if (!device) return;
  device.dataset.theme = state.theme;
  device.dataset.set = state.set;
  device.dataset.device = state.device;
}

export function render() {
  const root = $('#app');
  const html = (RENDER[state.screen] || renderInicio)();
  const a11y = state.set === 'a11y';
  root.innerHTML = `<div class="device" data-device="${state.device}" data-set="${state.set}" data-theme="${state.theme}"><div class="shell ${state.device === 'web' && !a11y ? '' : 'stack'}" style="${state.device !== 'web' || a11y ? 'flex-direction:column' : ''}">${html}</div></div>`;
  applyChrome();
  bindForm();
  
  if (state.screen === 'entrar') {
    requestAnimationFrame(() => {
      import('./app.js').then(({ renderGoogleButton }) => {
        if (renderGoogleButton) renderGoogleButton();
      });
    });
  }
}

function bindComparar() {
  const selA = $('#comparar-a');
  const selB = $('#comparar-b');
  if (!selA || !selB) return;
  const update = () => {
    state.comparar = {
      a: selA.value || null,
      b: selB.value || null
    };
    render();
    bindComparar();
  };
  selA.addEventListener('change', update);
  selB.addEventListener('change', update);
}

function bindForm() {
  const main = $('.main') || document;
  main.querySelectorAll('input, select').forEach((el) => {
    el.addEventListener('change', () => {
      const name = el.name;
      if (!name) return;
      
      if (name === 'filtrar12') {
        state.historialFiltrar12 = el.checked;
        render();
        return;
      }
      
      if (el.type === 'checkbox') state.form[name] = el.checked;
      else state.form[name] = el.value;
      
      if (name === 'year' && state.screen === 'analisis') {
        render();
      }
    });
  });
  const formLogin = $('#formLogin');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { enviarAuth } = await import('./api.js');
      enviarAuth('/api/auth/login', {
        email: $('#loginEmail').value.trim(),
        password: $('#loginPassword').value
      });
    });
  }
  const formRegistro = $('#formRegistro');
  if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { enviarAuth } = await import('./api.js');
      enviarAuth('/api/auth/registro', {
        email: $('#regEmail').value.trim(),
        password: $('#regPassword').value,
        nombre: $('#regNombre').value.trim() || undefined
      });
    });
  }
}

export async function onRoute() {
  parseHash();
  state.device = deviceDe();
  state.error = null;
  const oauthErr = sessionStorage.getItem(KEYS.authError);
  if (oauthErr) {
    state.error = oauthErr;
    sessionStorage.removeItem(KEYS.authError);
  }
  if (state.screen === 'historial' || state.screen === 'comparar') {
    await cargarHistorial();
    if (state.screen === 'comparar') {
      render();
      bindComparar();
    }
    return;
  }
  if (state.screen === 'analisis' && state.auth) {
    await cargarPeriodosOcupados();
  }
  if (state.screen === 'resultados' && state.auth && !state.historial.length) {
    try { 
      state.historial = await api('/api/historial'); 
    } catch (err) {
      if (err.status === 401) {
        const { expireSession } = await import('./state.js');
        expireSession();
        state.notice = 'La sesión no era válida. El resultado sigue acá; entrá de nuevo para ver el historial.';
      }
    }
  }
  render();
  
  if (state.screen === 'resultados') {
    translateRecommendations().catch(() => {});
  }
}

export function initRouter() {
  setRouter(go, render);
}
