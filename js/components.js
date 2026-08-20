/**
 * Componentes UI reutilizables
 */

import { state } from './state.js';
import { esc, etiquetaCat } from './utils.js';
import { t, getLang } from './i18n.js';

const LAMP = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 21h6M10 17h4M12 3a6 6 0 0 0-4 10c.6.6 1 1.5 1 2.4V16h6v-.6c0-.9.4-1.8 1-2.4A6 6 0 0 0 12 3z"
      fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

export function wordmark() {
  return `<span class="word">Energi<span class="ai">AI</span></span>`;
}

export function lockup({ compact = false, inverse = false } = {}) {
  const inv = inverse || state.theme === 'dark';
  const cls = `lockup${compact ? ' compact' : ''}${inv ? ' inverse' : ''}`;
  return `<div class="${cls}" aria-label="EnergiAI"><img class="mark" src="/img/logo-mark.png" alt="">${wordmark()}</div>`;
}

export function markOnly() {
  return `<img class="mark" src="/img/logo-mark.png" alt="EnergiAI">`;
}

export function bannerBrand(size = '') {
  return `<div class="banner-plate${size ? ' ' + size : ''}"><img src="/img/logo-banner.svg" alt="EnergiAI"></div>`;
}

export function lamp(a11y) {
  const dark = state.theme === 'dark';
  const label = dark ? t('theme.claro') : t('theme.oscuro');
  const cls = `theme-toggle${dark ? ' filled' : ''}${a11y ? ' a11y' : ''}`;
  return `<button class="${cls}" type="button" data-action="theme" aria-pressed="${dark}" aria-label="${label}" title="${label}">
    ${LAMP}${a11y ? `<span>${label}</span>` : ''}
  </button>`;
}

const FLAG_ES = `<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#c60b1e"/><rect y="4" width="24" height="8" fill="#ffc400"/></svg>`;
const FLAG_EN = `<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#012169"/><path d="M0,0 L24,16 M24,0 L0,16" stroke="#fff" stroke-width="2.5"/><path d="M0,0 L24,16 M24,0 L0,16" stroke="#c8102e" stroke-width="1.5"/><path d="M12,0 V16 M0,8 H24" stroke="#fff" stroke-width="4"/><path d="M12,0 V16 M0,8 H24" stroke="#c8102e" stroke-width="2.5"/></svg>`;

export function langToggle(a11y = false) {
  const isEn = state.lang === 'en';
  const label = isEn ? 'Español' : 'English';
  const flag = isEn ? FLAG_ES : FLAG_EN;
  const cls = `lang-toggle${a11y ? ' a11y' : ''}`;
  return `<button class="${cls}" type="button" data-action="lang" aria-label="${label}" title="${label}">
    ${flag}${a11y ? `<span>${isEn ? 'ES' : 'EN'}</span>` : ''}
  </button>`;
}

export function hatch(n = 8) {
  return `<div class="hatch" aria-hidden="true">${'<i></i>'.repeat(n)}</div>`;
}

export function authButtons(hideIfLoginScreen = false) {
  if (state.auth) {
    const who = state.auth.nombre || state.auth.email;
    return `<span class="user-chip" title="${esc(state.auth.email)}">${esc(who)}</span>
      <button class="btn ghost" type="button" data-action="logout">${t('auth.salir')}</button>`;
  }
  if (hideIfLoginScreen && state.screen === 'entrar') return '';
  return `<button class="btn ghost" type="button" data-action="login">${t('auth.entrar')}</button>
    <button class="btn primary" type="button" data-action="registro">${t('auth.crearCuenta')}</button>`;
}

export function navLinks() {
  return `<nav class="nav">
    <button class="link${state.screen === 'inicio' ? ' on' : ''}" type="button" data-go="inicio">${t('nav.inicio')}</button>
    <button class="link${state.screen === 'analisis' ? ' on' : ''}" type="button" data-go="analisis">${t('nav.analisis')}</button>
    <button class="link${state.screen === 'resultados' ? ' on' : ''}" type="button" data-go="resultados">${t('nav.resultados')}</button>
    <button class="link${state.screen === 'historial' ? ' on' : ''}" type="button" data-go="historial">${t('nav.historial')}</button>
    <button class="link${state.screen === 'comparar' ? ' on' : ''}" type="button" data-go="comparar">${t('nav.comparar')}</button>
    <button class="link" type="button" data-action="a11y">${state.set === 'a11y' ? t('nav.vistaEstandar') : t('nav.accesible')}</button>
  </nav>`;
}

export function headerId() {
  if (state.device !== 'web') {
    return `<div class="header">${navLinks()}<div class="header-actions">${authButtons(true)}</div></div>`;
  }
  return `<div class="header">
    <a href="#inicio">${lockup()}</a>
    ${navLinks()}
    <div class="header-actions">${langToggle(false)}${lamp(false)}${authButtons(true)}</div>
  </div>`;
}

export function chromeId() {
  if (state.device === 'web') {
    return `<aside class="rail">${markOnly()}<span class="cap">IA</span><div class="pulse"></div></aside>`;
  }
  const brand = state.device === 'tablet' ? lockup({ compact: true, inverse: true }) : markOnly();
  return `<div class="topbar">
    <a class="brand" href="#inicio">${brand}</a>
    <div class="pulse"></div>
    ${langToggle(false)}
    ${lamp(false)}
  </div>`;
}

export function chromeA11y() {
  return `<div class="a11y-bar">
    <a class="skip" href="#contenido">${t('a11y.saltar')}</a>
    <div class="header-actions">
      <button class="btn ghost" type="button" data-action="listen" style="min-height:56px">${t('a11y.escuchar')}</button>
      ${langToggle(true)}
      ${lamp(true)}
      <button class="btn ghost" type="button" data-action="a11y">${t('nav.vistaEstandar')}</button>
    </div>
  </div>`;
}

export function alertBox() {
  if (state.error) return `<div class="alert" role="alert">${esc(state.error)}</div>`;
  if (state.notice) return `<div class="alert notice" role="status">${esc(state.notice)}</div>`;
  return '';
}

export function speak() {
  const map = {
    inicio: t('speak.inicio'),
    analisis: t('speak.analisis'),
    resultados: state.result ? t('speak.resultados').replace('{cat}', etiquetaCat(state.result.categoria)) : t('speak.sin_resultado'),
    entrar: t('speak.entrar'),
    historial: t('speak.historial'),
    comparar: t('speak.comparar'),
  };
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(map[state.screen] || '');
  u.lang = getLang() === 'en' ? 'en-US' : 'es-AR';
  window.speechSynthesis.speak(u);
}
