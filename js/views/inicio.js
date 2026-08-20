/**
 * Vista: Inicio / Landing
 */

import { state } from '../state.js';
import { chromeA11y, chromeId, headerId, lockup, bannerBrand, alertBox, authButtons } from '../components.js';

export function renderInicio() {
  const a11y = state.set === 'a11y';
  if (a11y) {
    return `
      ${chromeA11y()}
      <div class="main" id="contenido">
        ${state.device === 'web' ? `<div class="header">${lockup()}<div class="header-actions">${authButtons()}</div></div>` : ''}
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
          ${state.device === 'web' ? bannerBrand() : ''}
          <h1 class="display">Tu casa habla<br>en kilovatios.<br>Nosotros traducimos.</h1>
          <p>Diagnóstico con los datos de tu factura. Categoría, costo, huella de carbono y tres recomendaciones.</p>
          ${alertBox()}
          <div class="cta-row">
            <button class="btn primary" type="button" data-go="analisis">Comenzar análisis</button>
            ${state.device !== 'web' ? `
              ${state.auth 
                ? `<span class="user-chip" style="font-size:14px" title="${state.auth.email}">${state.auth.nombre || state.auth.email}</span>
                   <button class="btn ghost" type="button" data-action="logout" style="padding:10px 16px;min-height:40px;font-size:14px">Salir</button>`
                : `<button class="btn ghost" type="button" data-action="login" style="padding:10px 16px;min-height:40px;font-size:14px">Entrar</button>
                   <button class="btn navy" type="button" data-action="registro" style="padding:10px 16px;min-height:40px;font-size:14px">Crear cuenta</button>`
              }` 
            : `<span class="caption" style="text-transform:none">${state.auth ? 'Sesión activa · podés guardar' : '2 min · sin cuenta, o entrá para historial'}</span>`}
          </div>
        </div>
        <aside class="meter">
          <div class="caption">Qué ves al terminar</div>
          <p style="color:#fff;margin:0">Tu categoría, costo estimado y 3 acciones para mejorar</p>
          <p class="caption" style="color:#c7cbd1;text-transform:none">Con cuenta: historial y desglose detallado.</p>
        </aside>
      </div>
      ${state.device === 'web' ? `
        <div class="bento">
          <article class="card"><div class="stripe"></div><h2>Sin cuenta</h2><p>Analizá tu consumo al instante. Ves tu categoría, costo y tres recomendaciones.</p></article>
          <article class="card"><div class="stripe"></div><h2>Con cuenta</h2><p>Guardá tus análisis y seguí tu evolución mes a mes.</p></article>
          <article class="card"><div class="stripe"></div><h2>Recomendaciones</h2><p>Tres acciones concretas para reducir tu consumo.</p></article>
        </div>
        <div class="foot">${bannerBrand('sm')}<span>© 2026 EnergiAI</span></div>
      ` : ''}
    </div>`;
}
