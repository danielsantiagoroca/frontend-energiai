/**
 * Vista: Historial
 */

import { state } from '../state.js';
import { chromeA11y, chromeId, headerId, alertBox } from '../components.js';
import { chartHistorial } from './resultados.js';
import { t } from '../i18n.js';

export function renderHistorial() {
  const a11y = state.set === 'a11y';
  if (!state.auth) {
    return `
      ${a11y ? chromeA11y() : chromeId()}
      <div class="main" id="contenido">
        ${headerId()}
        <h1>${t('nav.historial')}</h1>
        <p>${t('historial.loginVer')}</p>
        ${alertBox()}
        <div class="cta-row">
          <button class="btn primary" type="button" data-action="login" data-next="#historial">${t('auth.entrar')}</button>
          ${state.result ? `<button class="btn ghost" type="button" data-go="resultados">${t('historial.volverResultados')}</button>` : `<button class="btn ghost" type="button" data-go="analisis">${t('resultados.irAnalisis')}</button>`}
        </div>
      </div>`;
  }
  const total = state.historial.length;
  const showFilter = total > 12;
  return `
    ${a11y ? chromeA11y() : chromeId()}
    <div class="main" id="contenido">
      ${headerId()}
      <h1>${t('historial.titulo')}</h1>
      <p>${t('historial.toca')}</p>
      ${alertBox()}
      ${showFilter ? `<div class="checks" style="margin-bottom:12px">
        <label class="check"><input type="checkbox" name="filtrar12" ${state.historialFiltrar12 ? 'checked' : ''}> ${t('historial.filtro12')}</label>
        <span class="caption" style="margin-left:8px">(${total} ${t('historial.total')})</span>
      </div>` : ''}
      ${state.loading ? `<p>${t('historial.cargando')}</p>` : chartHistorial(state.historial, state.historialFiltrar12)}
    </div>`;
}
