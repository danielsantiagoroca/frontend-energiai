/**
 * Estado global de la aplicación
 */

import { KEYS } from './config.js';
import { deviceDe, sanitizeResult } from './utils.js';

function loadAuth() {
  const token = localStorage.getItem(KEYS.token);
  if (!token) return null;
  return {
    token,
    email: localStorage.getItem(KEYS.email) || '',
    nombre: localStorage.getItem(KEYS.nombre) || ''
  };
}

export function defaultForm() {
  return {
    tipo_inmueble: '',
    month: '',
    uso_horario_pico: '',
    horas_alto_consumo: '',
    cantidad_equipos: '',
    consumo_mensual: '',
    numero_personas: '',
    tiene_aire_acondicionado: false,
    tiene_calentador: false,
    tiene_iluminacion_led: false,
    antiguedad_electrodomesticos: '',
    tarifa_electrica: '',
    guardar: true
  };
}

export const state = {
  set: localStorage.getItem(KEYS.set) || 'id',
  device: deviceDe(),
  screen: 'inicio',
  theme: localStorage.getItem(KEYS.theme) || 'light',
  auth: loadAuth(),
  form: defaultForm(),
  result: null,
  historial: [],
  error: null,
  notice: null,
  loginTab: 'login',
  loading: false,
  detalleId: null,
  wizardStep: 0
};

export function applyAuth(token, email, nombre) {
  if (token) localStorage.setItem(KEYS.token, token);
  localStorage.setItem(KEYS.email, email || '');
  localStorage.setItem(KEYS.nombre, nombre || localStorage.getItem(KEYS.nombre) || '');
  state.auth = loadAuth() || (email ? { token: token || '', email, nombre: nombre || '' } : null);
}

export function expireSession() {
  localStorage.removeItem(KEYS.token);
  localStorage.removeItem(KEYS.email);
  localStorage.removeItem(KEYS.nombre);
  state.auth = null;
  state.historial = [];
}

export function restoreSession() {
  try {
    if (state.auth) {
      const r = sessionStorage.getItem(KEYS.result);
      if (r) state.result = sanitizeResult(JSON.parse(r));
    }
  } catch (_) { /* ignore */ }
}

export function persistSession() {
  try {
    sessionStorage.setItem(KEYS.result, JSON.stringify(sanitizeResult(state.result)));
    sessionStorage.setItem(KEYS.form, JSON.stringify(state.form));
  } catch (_) { /* ignore */ }
}

export function logout() {
  expireSession();
  sessionStorage.removeItem(KEYS.form);
  sessionStorage.removeItem(KEYS.result);
  sessionStorage.removeItem(KEYS.next);
  state.form = defaultForm();
  state.result = null;
  state.historial = [];
  state.notice = null;
}

export function validateForm() {
  const f = state.form;
  const errors = [];
  
  if (!f.tipo_inmueble) errors.push('Seleccioná el tipo de vivienda');
  if (!f.month) errors.push('Seleccioná el mes de la factura');
  if (!f.uso_horario_pico) errors.push('Indicá si usás horario pico');
  if (f.horas_alto_consumo === '' || f.horas_alto_consumo === null) errors.push('Ingresá las horas de alto consumo');
  if (f.cantidad_equipos === '' || f.cantidad_equipos === null) errors.push('Ingresá la cantidad de equipos');
  if (f.consumo_mensual === '' || f.consumo_mensual === null) errors.push('Ingresá el consumo mensual');
  
  const consumo = Number(f.consumo_mensual);
  if (f.consumo_mensual !== '' && f.consumo_mensual !== null && (consumo < 80 || consumo > 1200)) {
    errors.push('El consumo debe estar entre 80 y 1200 kWh');
  }
  
  return errors;
}

export function facturaPayload() {
  const f = state.form;
  const body = {
    consumo_mensual: Number(f.consumo_mensual),
    uso_horario_pico: f.uso_horario_pico,
    cantidad_equipos: Number(f.cantidad_equipos),
    tipo_inmueble: f.tipo_inmueble,
    horas_alto_consumo: Number(f.horas_alto_consumo),
    month: String(f.month),
    tiene_aire_acondicionado: Boolean(f.tiene_aire_acondicionado),
    tiene_calentador: Boolean(f.tiene_calentador),
    tiene_iluminacion_led: Boolean(f.tiene_iluminacion_led)
  };
  if (f.numero_personas) body.numero_personas = Number(f.numero_personas);
  if (f.antiguedad_electrodomesticos) body.antiguedad_electrodomesticos = f.antiguedad_electrodomesticos;
  if (f.tarifa_electrica !== '' && f.tarifa_electrica != null) body.tarifa_electrica = Number(f.tarifa_electrica);
  return body;
}
