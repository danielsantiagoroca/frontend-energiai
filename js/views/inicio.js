/**
 * Vista: Inicio / Landing
 */

import { state } from '../state.js';
import { chromeA11y, chromeId, headerId, lockup, bannerBrand, alertBox, authButtons } from '../components.js';
import { t } from '../i18n.js';

export function renderInicio() {
  const a11y = state.set === 'a11y';
  if (a11y) {
    return `
      ${chromeA11y()}
      <div class="main" id="contenido">
        ${state.device === 'web' ? `<div class="header">${lockup()}<div class="header-actions">${authButtons()}</div></div>` : ''}
        <h1 class="display">${t('inicio.headlineA11y')}</h1>
        <p>${t('inicio.subA11y')}</p>
        ${alertBox()}
        <div class="cta-row">
          <button class="btn primary" type="button" data-go="analisis">${t('inicio.empezar')}</button>
          ${state.auth ? `<button class="btn navy" type="button" data-go="historial">${t('inicio.verHistorial')}</button>`
            : `<button class="btn navy" type="button" data-action="login" data-next="#historial">${t('inicio.entrarHistorial')}</button>`}
        </div>
      </div>`;
  }
  return `
    ${chromeId()}
    <div class="main">
      ${headerId()}
      <div class="hero">
        <div class="copy">
          <div class="kicker"><span class="dot"></span> ${t('inicio.kicker')}</div>
          ${state.device === 'web' ? bannerBrand() : ''}
          <h1 class="display">${t('inicio.headline')}</h1>
          <p>${t('inicio.sub')}</p>
          ${alertBox()}
          <div class="cta-row">
            <button class="btn primary" type="button" data-go="analisis">${t('inicio.comenzar')}</button>
            ${state.device !== 'web' ? `
              ${state.auth 
                ? `<span class="user-chip" style="font-size:14px" title="${state.auth.email}">${state.auth.nombre || state.auth.email}</span>
                   <button class="btn ghost" type="button" data-action="logout" style="padding:10px 16px;min-height:40px;font-size:14px">${t('auth.salir')}</button>`
                : `<button class="btn ghost" type="button" data-action="login" style="padding:10px 16px;min-height:40px;font-size:14px">${t('auth.entrar')}</button>
                   <button class="btn navy" type="button" data-action="registro" style="padding:10px 16px;min-height:40px;font-size:14px">${t('auth.crearCuenta')}</button>`
              }` 
            : `<span class="caption" style="text-transform:none">${state.auth ? t('inicio.sesionActiva') : t('inicio.sinCuenta')}</span>`}
          </div>
        </div>
        <aside class="meter">
          <div class="caption">${t('inicio.queVes')}</div>
          <p style="color:#fff;margin:0">${t('inicio.queVesDesc')}</p>
          <p class="caption" style="color:#c7cbd1;text-transform:none">${t('inicio.conCuentaDesc')}</p>
        </aside>
      </div>
      ${state.device === 'web' ? `
        <div class="bento">
          <article class="card"><div class="stripe"></div><h2>${t('inicio.cardSinCuenta')}</h2><p>${t('inicio.cardSinCuentaDesc')}</p></article>
          <article class="card"><div class="stripe"></div><h2>${t('inicio.cardConCuenta')}</h2><p>${t('inicio.cardConCuentaDesc')}</p></article>
          <article class="card"><div class="stripe"></div><h2>${t('inicio.cardRecomendaciones')}</h2><p>${t('inicio.cardRecomendacionesDesc')}</p></article>
        </div>
        <div class="foot">${bannerBrand('sm')}<span>${t('app.copyright')}</span></div>
      ` : ''}
    </div>`;
}
