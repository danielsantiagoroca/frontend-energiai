/**
 * Vista: Resultados
 */

import { state } from '../state.js';
import { MESES } from '../config.js';
import { esc, etiquetaCat, fmt, fmtMoney, pick, pctLabel, labelMesItem, formatTendencia, probabilidadesHtml, mesNumero } from '../utils.js';
import { chromeA11y, chromeId, headerId, alertBox, hatch } from '../components.js';

function recsHtml(lista) {
  const items = (lista && lista.length ? lista : ['Sin recomendaciones en este registro.']).slice(0, 3);
  return items.map((t, i) => `
    <div class="rec">
      <span class="n">${String(i + 1).padStart(2, '0')}</span>
      <div><p style="color:inherit">${esc(t)}</p></div>
    </div>`).join('');
}

function cifra(label, val) {
  if (val == null || val === '') return '';
  return `<div class="field"><div class="caption">${esc(label)}</div><div class="val">${esc(val)}</div></div>`;
}

function probsHtml(result) {
  const probs = probabilidadesHtml(result);
  if (!probs || !probs.length) return '';
  return `<div class="stack" style="margin-bottom:12px">
    <div class="caption">Probabilidad por categoría</div>
    <div class="costos-grid">${probs.map((p) => 
      `<div class="field"><div class="caption">${esc(p.label)}</div><div class="val">${p.pct}%</div></div>`
    ).join('')}</div>
  </div>`;
}

function costosHtml(costos, resumen, result) {
  const c = costos || {};
  const r = resumen || {};
  const iie = result ? pick(result, 'indiceEficiencia', 'indice_eficiencia') : null;
  const proy = c.proyeccion_estacional || c.proyeccionEstacional || [];
  const filas = [
    cifra('Costo base', c.costo_bruto_mensual != null ? `${fmtMoney(c.costo_bruto_mensual)} USD` : null),
    cifra('Costo con recargos', c.costo_ajustado_mensual != null ? `${fmtMoney(c.costo_ajustado_mensual)} USD` : null),
    cifra('Estación', c.estacion),
    cifra('Recargo estacional', pctLabel(c.pct_estacional)),
    cifra('Recargo horario pico', pctLabel(c.pct_horario_pico)),
    cifra('Recargo sin LED', pctLabel(c.pct_sin_led)),
    cifra('Recargo equipos antiguos', pctLabel(c.pct_antiguedad)),
    cifra('Ahorro posible / mes', c.ahorro_potencial_mensual != null ? `${fmtMoney(c.ahorro_potencial_mensual)} USD` : null),
    cifra('Ahorro posible / año', c.ahorro_potencial_anual != null ? `${fmtMoney(c.ahorro_potencial_anual)} USD` : null),
    cifra('Consumo por persona', iie != null ? `${fmt(iie, 1)} kWh` : null),
    cifra('Tendencia', formatTendencia(r.tendencia)),
    cifra('Análisis previos', r.analisis_previos != null ? r.analisis_previos : null),
    cifra('Promedio anterior', r.consumo_promedio_kwh != null ? `${fmt(r.consumo_promedio_kwh, 0)} kWh` : null)
  ].join('');
  const proj = Array.isArray(proy) && proy.length
    ? `<div class="stack"><h2 style="margin:0;color:inherit">Proyección por estación</h2><div class="costos-grid">${proy.map((p) =>
        cifra(p.estacion + (p.es_estacion_actual || p.esEstacionActual ? ' (actual)' : ''),
          fmtMoney(pick(p, 'costo_mensual_estimado', 'costoMensualEstimado')) + ' USD')).join('')}</div></div>`
    : '';
  const probabilidades = probsHtml(result);
  if (!filas.replace(/\s/g, '') && !proj && !probabilidades) {
    return `<p>Entrá con tu cuenta para ver el desglose de costos y tu historial.</p>`;
  }
  return `${probabilidades}<div class="costos-grid">${filas}</div>${proj}`;
}

export function chartHistorial(items, filtrar12 = false) {
  if (!items.length) return '<p>No hay análisis guardados todavía.</p>';
  const sorted = [...items].sort((a, b) => {
    const anioA = pick(a, 'anio') || new Date(pick(a, 'creadoEn', 'creado_en')).getFullYear();
    const anioB = pick(b, 'anio') || new Date(pick(b, 'creadoEn', 'creado_en')).getFullYear();
    if (anioA !== anioB) return anioA - anioB;
    const mesA = mesNumero(pick(a, 'mes', 'month')) || 0;
    const mesB = mesNumero(pick(b, 'mes', 'month')) || 0;
    return mesA - mesB;
  });
  const ordered = filtrar12 ? sorted.slice(-12) : sorted;
  const kwhs = ordered.map((it) => Number(pick(it, 'consumoMensual', 'consumo_mensual')) || 0);
  const co2s = ordered.map((it) => {
    const v = pick(it, 'huella_carbono_kg_co2e_mes', 'huellaCarbonoKgCo2eMes');
    if (v == null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  });
  const conHuella = co2s.filter((v) => v != null);
  const maxK = Math.max(...kwhs, 1);
  const maxC = conHuella.length ? Math.max(...conHuella, 1) : 1;
  const left = 48, right = conHuella.length ? 52 : 16, top = 12, bottom = 36, plotH = 180;
  const gw = 40;
  const plotW = Math.max(ordered.length * gw, 320);
  const w = left + plotW + right;
  const h = top + plotH + bottom;
  const ticks = 4;
  let yLabels = '';
  for (let t = 0; t <= ticks; t++) {
    const frac = t / ticks;
    const y = top + plotH - frac * plotH;
    yLabels += `<text class="chart-axis" x="4" y="${y + 4}">${Math.round(maxK * frac)}</text>`;
    if (conHuella.length) {
      yLabels += `<text class="chart-axis" x="${w - 4}" y="${y + 4}" text-anchor="end">${Math.round(maxC * frac)}</text>`;
    }
  }
  const groups = ordered.map((it, i) => {
    const x = left + i * gw + 6;
    const hk = (kwhs[i] / maxK) * plotH;
    const id = pick(it, 'id');
    const kg = co2s[i];
    const title = kg == null
      ? `${labelMesItem(it)}: ${fmt(kwhs[i], 0)} kWh`
      : `${labelMesItem(it)}: ${fmt(kwhs[i], 0)} kWh, ${fmt(kg, 1)} kg CO₂`;
    const barraCo2 = kg == null ? ''
      : `<rect class="bar-co2" x="${x + 14}" y="${top + plotH - (kg / maxC) * plotH}" width="12" height="${Math.max((kg / maxC) * plotH, 2)}" rx="3"></rect>`;
    return `<g class="bar-group" tabindex="0" role="button" data-analisis-id="${id}" aria-label="${esc(title)}">
      <title>${esc(title)}</title>
      <rect class="bar-kwh" x="${x}" y="${top + plotH - hk}" width="12" height="${Math.max(hk, 2)}" rx="3"></rect>
      ${barraCo2}
      <text class="chart-axis" x="${x + 12}" y="${h - 8}" text-anchor="middle">${esc(labelMesItem(it))}</text>
    </g>`;
  }).join('');
  return `
    <div class="chart-legend">
      <span><i class="kwh"></i>Consumo</span>
      ${conHuella.length ? `<span><i class="co2"></i>Huella de carbono</span>` : ''}
    </div>
    <div class="chart-wrap">
      <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Historial de consumo">
        ${yLabels}${groups}
      </svg>
    </div>`;
}

export function renderResultados() {
  const a11y = state.set === 'a11y';
  const r = state.result;
  if (!r) {
    return `
      ${a11y ? chromeA11y() : chromeId()}
      <div class="main" id="contenido">
        ${headerId()}
        <h1>Todavía no hay un resultado</h1>
        <p>Completá un análisis o abrí una barra del historial.</p>
        <div class="cta-row">
          <button class="btn primary" type="button" data-go="analisis">Ir al análisis</button>
          <button class="btn ghost" type="button" data-go="historial">Historial</button>
        </div>
      </div>`;
  }
  const cat = etiquetaCat(r.categoria);
  const costo = pick(r, 'costoEstimadoMensual', 'costo_estimado_mensual');
  const huella = pick(r, 'huella_carbono_kg_co2e_mes', 'huellaCarbonoKgCo2eMes');
  const recs = pick(r, 'recomendaciones') || [];
  const costos = pick(r, 'costos');
  const resumen = pick(r, 'historial_resumen', 'historialResumen');
  const consumo = pick(r, 'consumoMensual', 'consumo_mensual')
    || pick(r.consulta_modelo || {}, 'consumo_mensual')
    || state.form.consumo_mensual;
  return `
    ${a11y ? chromeA11y() : chromeId()}
    <div class="main" id="contenido">
      ${a11y ? '' : headerId()}
      ${alertBox()}
      <div class="split">
        <div class="stamp">
          ${hatch(state.device === 'mobile' ? 8 : 12)}
          <div class="caption" style="color:var(--green)">Tu perfil de consumo</div>
          <h1 class="display" style="color:inherit">${esc(cat)}</h1>
          <h2 style="margin:0;color:var(--green);font-size:28px">${fmtMoney(costo)} USD / mes</h2>
          <p style="color:inherit">${fmt(consumo, 0)} kWh${huella != null
            ? ` · ${fmt(huella, 1)} kg CO₂`
            : ''}</p>
        </div>
        <div class="stack">
          <h2 style="margin:0;color:inherit">Tres acciones sugeridas</h2>
          ${recsHtml(recs)}
        </div>
      </div>
      ${costosHtml(costos, resumen, r)}
      ${state.auth && state.historial.length ? `<h2 style="margin:0;color:inherit">Tu historial</h2>${chartHistorial(state.historial)}` : ''}
      <div class="cta-row">
        <button class="btn primary" type="button" data-go="analisis">Otro análisis</button>
        ${!state.auth ? `<button class="btn navy" type="button" data-action="login" data-next="#resultados">Entra para guardar</button>` : ''}
        ${state.auth && r.guardado === false ? `<button class="btn navy" type="button" data-action="guardar">Guardar en historial</button>` : ''}
        <button class="btn ghost" type="button" data-go="historial">Ver historial</button>
      </div>
    </div>`;
}
