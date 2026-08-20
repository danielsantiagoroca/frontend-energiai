/**
 * Funciones utilitarias
 */

import { MESES, CAT } from './config.js';

export function $(sel, root = document) {
  return root.querySelector(sel);
}

export function pick(obj, ...keys) {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
  }
  return undefined;
}

export function mesNumero(valor) {
  if (valor == null) return null;
  const n = Number(valor);
  if (n >= 1 && n <= 12) return n;
  const i = MESES.findIndex((m) => m.toLowerCase() === String(valor).toLowerCase());
  return i > 0 ? i : null;
}

export function etiquetaCat(c) {
  if (!c) return '—';
  return CAT[c] || CAT[String(c).toUpperCase()] || String(c);
}

export function fmt(n, d = 1) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return Number(n).toLocaleString('es', { maximumFractionDigits: d, minimumFractionDigits: 0 });
}

export function fmtMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return Number(n).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function deviceDe() {
  const w = window.innerWidth;
  if (w < 640) return 'mobile';
  if (w < 1100) return 'tablet';
  return 'web';
}

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function pctLabel(x) {
  if (x == null || x === '') return null;
  return `${(Number(x) * 100).toFixed(0)} %`;
}

export function probabilidadDe(result) {
  if (!result) return null;
  const scalar = pick(result, 'probabilidad');
  if (scalar != null && typeof scalar !== 'object') return scalar;
  const map = pick(result, 'probabilidades');
  if (!map || typeof map !== 'object') return null;
  const cat = result.categoria;
  const keys = [cat, etiquetaCat(cat), String(cat || '').toUpperCase(), String(cat || '')];
  for (const k of keys) {
    if (k && map[k] != null) return map[k];
  }
  return null;
}

export function esIpPrivada() {
  const host = location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return false;
  if (/^10\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  return false;
}

export function sanitizeResult(r) {
  if (!r || typeof r !== 'object') return r;
  const copy = { ...r };
  const consumo = pick(copy, 'consumoMensual', 'consumo_mensual')
    || pick(copy.consulta_modelo || copy.consultaModelo || {}, 'consumo_mensual', 'consumoMensual');
  if (consumo != null && copy.consumoMensual == null && copy.consumo_mensual == null) {
    copy.consumo_mensual = consumo;
  }
  delete copy.vector_onnx;
  delete copy.vectorOnnx;
  delete copy.consulta_modelo;
  delete copy.consultaModelo;
  delete copy.features_sinteticas;
  delete copy.featuresSinteticas;
  return copy;
}

export function labelMesItem(item) {
  const n = mesNumero(pick(item, 'mes', 'month'));
  const anio = pick(item, 'anio');
  const creado = pick(item, 'creadoEn', 'creado_en');
  const y = anio || (creado ? new Date(creado).getFullYear() : '');
  const corto = n ? MESES[n].slice(0, 3) : '?';
  return y ? `${corto} ${String(y).slice(2)}` : corto;
}

export function formatTendencia(t) {
  if (!t) return null;
  const texto = String(t).replace(/_/g, ' ').trim();
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

export function probabilidadesHtml(result) {
  const probs = pick(result, 'probabilidades');
  if (!probs || typeof probs !== 'object') return null;
  const cats = ['EFICIENTE', 'MODERADO', 'INEFICIENTE'];
  const labels = { EFICIENTE: 'Eficiente', MODERADO: 'Moderado', INEFICIENTE: 'Ineficiente' };
  const items = cats.map((cat) => {
    const val = probs[cat] ?? probs[cat.toLowerCase()] ?? probs[labels[cat]];
    if (val == null) return null;
    const pct = (Number(val) * 100).toFixed(0);
    return { label: labels[cat], pct };
  }).filter(Boolean);
  if (!items.length) return null;
  return items;
}

import { state } from './state.js';

export function periodoOcupado(mes, year) {
  if (!state.periodosOcupados?.length) return false;
  const mesStr = String(mes);
  const anio = Number(year);
  return state.periodosOcupados.some(
    (p) => String(p.mes) === mesStr && Number(p.anio) === anio
  );
}
