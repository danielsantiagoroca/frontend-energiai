/**
 * Vista: Entrar (Login / Registro)
 */

import { state } from '../state.js';
import { chromeA11y, chromeId, headerId, alertBox } from '../components.js';

export function renderEntrar() {
  const a11y = state.set === 'a11y';
  const registro = state.loginTab === 'registro';
  return `
    ${a11y ? chromeA11y() : chromeId()}
    <div class="main" id="contenido">
      ${a11y ? '' : headerId()}
      <h1>${registro ? 'Creá tu cuenta.' : 'Tu casa, en claro.'}</h1>
      <p>Entrá para ver el historial y guardar análisis. El diagnóstico que ya calculaste no se pierde.</p>
      ${alertBox()}
      <div class="auth-tabs">
        <button class="btn ${registro ? 'ghost' : 'navy'}" type="button" data-action="login">Entrar</button>
        <button class="btn ${registro ? 'navy' : 'ghost'}" type="button" data-action="registro">Crear cuenta</button>
      </div>
      ${registro ? `
        <form id="formRegistro" class="stack">
          <div class="field-ctl"><label for="regNombre">Nombre</label>
            <input id="regNombre" name="nombre" type="text" autocomplete="name"></div>
          <div class="field-ctl"><label for="regEmail">Email</label>
            <input id="regEmail" name="email" type="email" autocomplete="username" required></div>
          <div class="field-ctl"><label for="regPassword">Contraseña (mínimo 8)</label>
            <input id="regPassword" name="password" type="password" autocomplete="new-password" minlength="8" required></div>
          <button class="btn primary" type="submit">${state.loading ? 'Creando…' : 'Crear cuenta'}</button>
        </form>` : `
        <form id="formLogin" class="stack">
          <div class="field-ctl"><label for="loginEmail">Email</label>
            <input id="loginEmail" name="email" type="email" autocomplete="username" required></div>
          <div class="field-ctl"><label for="loginPassword">Contraseña</label>
            <input id="loginPassword" name="password" type="password" autocomplete="current-password" required></div>
          <button class="btn primary" type="submit"${state.loading ? ' disabled' : ''}>${state.loading ? 'Entrando…' : 'Entrar'}</button>
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
