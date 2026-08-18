/**
 * Vista: Historial
 */

import { state } from '../state.js';
import { chromeA11y, chromeId, headerId, alertBox } from '../components.js';
import { chartHistorial } from './resultados.js';

export function renderHistorial() {
  const a11y = state.set === 'a11y';
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
      ${state.loading ? '<p>Cargando…</p>' : chartHistorial(state.historial)}
    </div>`;
}
