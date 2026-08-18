/**
 * EnergiAI Frontend - Entry Point
 * Módulo ES6
 */

import { KEYS } from './config.js';
import { state, logout, defaultForm } from './state.js';
import { $ } from './utils.js';
import { deviceDe } from './utils.js';
import { 
  ingestOAuthHash, 
  probeSession, 
  empezarGoogle, 
  analizar, 
  guardarAnalisis, 
  abrirDetalle,
  queueLogin,
  syncFormFromDom
} from './api.js';
import { go, render, onRoute, parseHash, initRouter } from './router.js';
import { speak } from './components.js';

async function initApp() {
  initRouter();
  
  ingestOAuthHash();
  await probeSession();
  
  const { restoreSession } = await import('./state.js');
  restoreSession();
  
  onRoute();
}

function setupEventListeners() {
  window.addEventListener('hashchange', () => { onRoute(); });
  
  window.addEventListener('resize', () => {
    const d = deviceDe();
    if (d !== state.device) { state.device = d; render(); }
  });
  
  document.body.addEventListener('click', (e) => {
    const grupo = e.target.closest('[data-analisis-id]');
    if (grupo) {
      abrirDetalle(grupo.getAttribute('data-analisis-id'));
      return;
    }
    
    const tipoBtn = e.target.closest('[data-tipo]');
    if (tipoBtn) {
      state.form.tipo_inmueble = tipoBtn.getAttribute('data-tipo');
      render();
      return;
    }
    
    const fieldBtn = e.target.closest('[data-field]');
    if (fieldBtn) {
      state.form[fieldBtn.getAttribute('data-field')] = fieldBtn.getAttribute('data-value');
      render();
      return;
    }
    
    const btn = e.target.closest('[data-action], [data-go]');
    if (!btn) return;
    
    if (btn.dataset.action === 'theme') {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(KEYS.theme, state.theme);
      render();
    }
    
    if (btn.dataset.action === 'a11y') {
      state.set = state.set === 'a11y' ? 'id' : 'a11y';
      localStorage.setItem(KEYS.set, state.set);
      state.wizardStep = 0;
      render();
    }
    
    if (btn.dataset.action === 'listen') speak();
    
    if (btn.dataset.action === 'logout') {
      logout();
      go('inicio');
    }
    
    if (btn.dataset.action === 'analizar') analizar();
    if (btn.dataset.action === 'guardar') guardarAnalisis();
    
    if (btn.dataset.action === 'login') {
      if (state.screen === 'entrar') {
        state.loginTab = 'login';
        go('entrar');
      } else {
        queueLogin('login', btn.dataset.next);
      }
      return;
    }
    
    if (btn.dataset.action === 'registro') {
      if (state.screen === 'entrar') {
        state.loginTab = 'registro';
        go('entrar/registro');
      } else {
        queueLogin('registro', btn.dataset.next);
      }
      return;
    }
    
    if (btn.dataset.action === 'google') {
      e.preventDefault();
      let next = sessionStorage.getItem(KEYS.next) || ('/index.html' + (location.hash || '#inicio'));
      if (next.includes('#entrar')) next = '/index.html#inicio';
      sessionStorage.setItem(KEYS.next, next);
      empezarGoogle();
      return;
    }
    
    if (btn.dataset.action === 'wizard-next') {
      syncFormFromDom();
      const { WIZARD } = import('./config.js');
      state.wizardStep = Math.min(state.wizardStep + 1, 9);
      render();
    }
    
    if (btn.dataset.action === 'wizard-back') {
      syncFormFromDom();
      state.wizardStep = Math.max(state.wizardStep - 1, 0);
      render();
    }
    
    if (btn.dataset.go) go(btn.dataset.go);
  });
  
  document.body.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const grupo = e.target.closest('[data-analisis-id]');
    if (!grupo) return;
    e.preventDefault();
    abrirDetalle(grupo.getAttribute('data-analisis-id'));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initApp();
});
