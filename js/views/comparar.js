/**
 * Vista: Comparación entre períodos
 */

import { state } from '../state.js';
import { MESES } from '../config.js';
import { esc, fmt, fmtMoney, pick, labelMesItem, etiquetaCat } from '../utils.js';
import { chromeA11y, chromeId, headerId, alertBox } from '../components.js';

function selectPeriodo(id, label, selected) {
  const items = state.historial || [];
  if (!items.length) return '';
  const opts = items.map((it) => {
    const itemId = pick(it, 'id');
    const mes = labelMesItem(it);
    const consumo = pick(it, 'consumoMensual', 'consumo_mensual');
    const sel = itemId == selected ? ' selected' : '';
    return `<option value="${itemId}"${sel}>${mes} - ${fmt(consumo, 0)} kWh</option>`;
  }).join('');
  return `
    <div class="field-ctl">
      <label for="${id}">${esc(label)}</label>
      <select id="${id}" name="${id}">
        <option value="">Seleccioná un período</option>
        ${opts}
      </select>
    </div>`;
}

function comparacionHtml(a, b) {
  if (!a || !b) return '';
  const consumoA = Number(pick(a, 'consumoMensual', 'consumo_mensual')) || 0;
  const consumoB = Number(pick(b, 'consumoMensual', 'consumo_mensual')) || 0;
  const costoA = Number(pick(a, 'costoEstimadoMensual', 'costo_estimado_mensual')) || 0;
  const costoB = Number(pick(b, 'costoEstimadoMensual', 'costo_estimado_mensual')) || 0;
  const huellaA = Number(pick(a, 'huella_carbono_kg_co2e_mes', 'huellaCarbonoKgCo2eMes')) || 0;
  const huellaB = Number(pick(b, 'huella_carbono_kg_co2e_mes', 'huellaCarbonoKgCo2eMes')) || 0;
  const catA = etiquetaCat(pick(a, 'categoria'));
  const catB = etiquetaCat(pick(b, 'categoria'));

  const diffConsumo = consumoB - consumoA;
  const diffCosto = costoB - costoA;
  const diffHuella = huellaB - huellaA;
  const pctConsumo = consumoA ? ((diffConsumo / consumoA) * 100).toFixed(1) : 0;
  const pctCosto = costoA ? ((diffCosto / costoA) * 100).toFixed(1) : 0;

  const arrow = (val) => val > 0 ? '↑' : val < 0 ? '↓' : '→';
  const color = (val, inverted = false) => {
    const good = inverted ? val > 0 : val < 0;
    const bad = inverted ? val < 0 : val > 0;
    if (good) return 'color: var(--green)';
    if (bad) return 'color: #e53e3e';
    return '';
  };

  return `
    <div class="stamp" style="background: var(--surface); color: var(--text)">
      <h2 style="margin:0;color:inherit">Comparación</h2>
      <div class="costos-grid" style="margin-top: 12px">
        <div class="field">
          <div class="caption">${esc(labelMesItem(a))}</div>
          <div class="val">${fmt(consumoA, 0)} kWh</div>
          <div class="caption">${esc(catA)}</div>
        </div>
        <div class="field">
          <div class="caption">${esc(labelMesItem(b))}</div>
          <div class="val">${fmt(consumoB, 0)} kWh</div>
          <div class="caption">${esc(catB)}</div>
        </div>
      </div>
    </div>

    <div class="bento" style="margin-top: 16px">
      <article class="card">
        <div class="stripe"></div>
        <div class="caption">Consumo</div>
        <h2 style="${color(diffConsumo)}">${arrow(diffConsumo)} ${Math.abs(diffConsumo).toFixed(0)} kWh</h2>
        <p>${pctConsumo > 0 ? '+' : ''}${pctConsumo}% vs período anterior</p>
      </article>
      <article class="card">
        <div class="stripe"></div>
        <div class="caption">Costo</div>
        <h2 style="${color(diffCosto)}">${arrow(diffCosto)} ${fmtMoney(Math.abs(diffCosto))} USD</h2>
        <p>${pctCosto > 0 ? '+' : ''}${pctCosto}% vs período anterior</p>
      </article>
      <article class="card">
        <div class="stripe"></div>
        <div class="caption">Huella de carbono</div>
        <h2 style="${color(diffHuella)}">${arrow(diffHuella)} ${fmt(Math.abs(diffHuella), 1)} kg CO₂</h2>
        <p>${diffHuella > 0 ? 'Aumentó' : diffHuella < 0 ? 'Disminuyó' : 'Sin cambios'}</p>
      </article>
    </div>

    ${diffConsumo < 0 ? `
      <div class="alert notice" style="margin-top: 16px">
        ¡Buen trabajo! Redujiste tu consumo en ${Math.abs(diffConsumo).toFixed(0)} kWh (${Math.abs(pctConsumo)}%).
      </div>
    ` : diffConsumo > 0 ? `
      <div class="alert" style="margin-top: 16px">
        Tu consumo aumentó ${diffConsumo.toFixed(0)} kWh (${pctConsumo}%). Revisá las recomendaciones para mejorar.
      </div>
    ` : ''}
  `;
}

export function renderComparar() {
  const a11y = state.set === 'a11y';
  const items = state.historial || [];

  if (!state.auth) {
    return `
      ${a11y ? chromeA11y() : chromeId()}
      <div class="main" id="contenido">
        ${headerId()}
        <h1>Comparar períodos</h1>
        <p>Entrá con tu cuenta para comparar tu desempeño entre dos períodos.</p>
        <div class="cta-row">
          <button class="btn primary" type="button" data-action="login" data-next="#comparar">Entrar</button>
          <button class="btn ghost" type="button" data-go="inicio">Volver al inicio</button>
        </div>
      </div>`;
  }

  if (items.length < 2) {
    return `
      ${a11y ? chromeA11y() : chromeId()}
      <div class="main" id="contenido">
        ${headerId()}
        <h1>Comparar períodos</h1>
        <p>Necesitás al menos dos análisis guardados para comparar. Actualmente tenés ${items.length}.</p>
        <div class="cta-row">
          <button class="btn primary" type="button" data-go="analisis">Hacer un análisis</button>
          <button class="btn ghost" type="button" data-go="historial">Ver historial</button>
        </div>
      </div>`;
  }

  const periodoA = state.comparar?.a;
  const periodoB = state.comparar?.b;
  const itemA = periodoA ? items.find((it) => pick(it, 'id') == periodoA) : null;
  const itemB = periodoB ? items.find((it) => pick(it, 'id') == periodoB) : null;

  return `
    ${a11y ? chromeA11y() : chromeId()}
    <div class="main" id="contenido">
      ${headerId()}
      ${alertBox()}
      <h1>Comparar períodos</h1>
      <p>Seleccioná dos períodos para ver cómo evolucionó tu consumo.</p>

      <div class="fields" style="margin: 16px 0">
        ${selectPeriodo('comparar-a', 'Período inicial', periodoA)}
        ${selectPeriodo('comparar-b', 'Período final', periodoB)}
      </div>

      ${itemA && itemB ? comparacionHtml(itemA, itemB) : `
        <div class="card">
          <p>Seleccioná dos períodos arriba para ver la comparación.</p>
        </div>
      `}

      <div class="cta-row" style="margin-top: 20px">
        <button class="btn ghost" type="button" data-go="historial">Ver historial completo</button>
        <button class="btn ghost" type="button" data-go="analisis">Nuevo análisis</button>
      </div>
    </div>`;
}
