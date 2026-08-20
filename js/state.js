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

const PERFIL_HOGAR_KEYS = [
  'tipo_inmueble',
  'tiene_aire_acondicionado',
  'tiene_iluminacion_led',
  'tiene_calentador',
  'cantidad_equipos',
  'antiguedad_electrodomesticos',
  'numero_personas',
  'tarifa_electrica'
];

function loadPerfilHogarLocal() {
  try {
    const raw = localStorage.getItem(KEYS.perfilHogar);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return null;
}

export function savePerfilHogar(form) {
  const perfil = {};
  PERFIL_HOGAR_KEYS.forEach(k => {
    if (form[k] !== undefined && form[k] !== '' && form[k] !== null) {
      perfil[k] = form[k];
    }
  });
  try {
    localStorage.setItem(KEYS.perfilHogar, JSON.stringify(perfil));
  } catch (_) { /* ignore */ }
}

function mesNumeroSimple(mes) {
  if (mes == null) return 0;
  const n = Number(mes);
  if (n >= 1 && n <= 12) return n;
  const nombres = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const idx = nombres.findIndex(m => m === String(mes).toLowerCase());
  return idx > 0 ? idx : 0;
}

function periodoANumero(mes, anio) {
  return (anio || 2000) * 12 + mesNumeroSimple(mes);
}

/**
 * Busca el perfil del análisis cronológicamente más cercano (pero no posterior) al mes/año objetivo.
 * Si no hay ninguno anterior, usa el más antiguo disponible.
 */
export function perfilMasCercano(historial, mesObjetivo, anioObjetivo) {
  if (!historial?.length) return null;
  
  const objetivo = periodoANumero(mesObjetivo || new Date().getMonth() + 1, anioObjetivo || new Date().getFullYear());
  
  let mejor = null;
  let mejorDist = Infinity;
  let masCercanoAnterior = null;
  let distAnterior = Infinity;
  
  for (const item of historial) {
    const perfil = item.perfil_hogar || item.perfilHogar;
    if (!perfil) continue;
    
    const mes = item.mes || item.month;
    const anio = item.anio || item.year;
    const periodo = periodoANumero(mes, anio);
    const dist = Math.abs(objetivo - periodo);
    
    if (periodo <= objetivo && dist < distAnterior) {
      distAnterior = dist;
      masCercanoAnterior = perfil;
    }
    
    if (dist < mejorDist) {
      mejorDist = dist;
      mejor = perfil;
    }
  }
  
  return masCercanoAnterior || mejor;
}

/**
 * Aplica el perfil del historial al formulario actual.
 * Llamar después de cargar el historial.
 */
export function aplicarPerfilDesdeHistorial() {
  if (!state.historial?.length) return false;
  
  const { perfil, item } = perfilMasCercanoConItem(state.historial, state.form.month || (new Date().getMonth() + 1), state.form.year);
  if (!perfil) return false;
  
  PERFIL_HOGAR_KEYS.forEach(k => {
    const valor = perfil[k];
    if (valor !== undefined && valor !== null && valor !== '') {
      state.form[k] = valor;
    }
  });
  
  state.perfilOrigenMes = item?.mes || item?.month;
  state.perfilOrigenAnio = item?.anio || item?.year;
  
  return true;
}

function perfilMasCercanoConItem(historial, mesObjetivo, anioObjetivo) {
  if (!historial?.length) return { perfil: null, item: null };
  
  const objetivo = periodoANumero(mesObjetivo || new Date().getMonth() + 1, anioObjetivo || new Date().getFullYear());
  
  let mejorItem = null;
  let mejorDist = Infinity;
  let anteriorItem = null;
  let distAnterior = Infinity;
  
  for (const item of historial) {
    const perfil = item.perfil_hogar || item.perfilHogar;
    if (!perfil) continue;
    
    const mes = item.mes || item.month;
    const anio = item.anio || item.year;
    const periodo = periodoANumero(mes, anio);
    const dist = Math.abs(objetivo - periodo);
    
    if (periodo <= objetivo && dist < distAnterior) {
      distAnterior = dist;
      anteriorItem = item;
    }
    
    if (dist < mejorDist) {
      mejorDist = dist;
      mejorItem = item;
    }
  }
  
  const selectedItem = anteriorItem || mejorItem;
  return { 
    perfil: selectedItem ? (selectedItem.perfil_hogar || selectedItem.perfilHogar) : null, 
    item: selectedItem 
  };
}

/**
 * Retorna el label del mes/año de donde vino el perfil precargado, o null.
 */
export function labelPerfilOrigen() {
  if (!state.perfilOrigenMes) return null;
  const mesNum = mesNumeroSimple(state.perfilOrigenMes);
  const nombres = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const mesCorto = mesNum > 0 ? nombres[mesNum] : state.perfilOrigenMes;
  const anioCorto = state.perfilOrigenAnio ? String(state.perfilOrigenAnio).slice(-2) : '';
  return anioCorto ? `${mesCorto} ${anioCorto}` : mesCorto;
}

export function defaultForm() {
  const base = {
    tipo_inmueble: '',
    month: '',
    year: new Date().getFullYear(),
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
  // Fallback a localStorage si el historial aún no está cargado
  const perfil = loadPerfilHogarLocal();
  if (perfil) {
    PERFIL_HOGAR_KEYS.forEach(k => {
      if (perfil[k] !== undefined) base[k] = perfil[k];
    });
  }
  return base;
}

export const state = {
  set: localStorage.getItem(KEYS.set) || 'id',
  device: deviceDe(),
  screen: 'inicio',
  theme: localStorage.getItem(KEYS.theme) || 'light',
  lang: localStorage.getItem(KEYS.lang) || 'es',
  auth: loadAuth(),
  form: defaultForm(),
  result: null,
  historial: [],
  periodosOcupados: [],
  error: null,
  notice: null,
  loginTab: 'login',
  loading: false,
  detalleId: null,
  wizardStep: 0,
  comparar: { a: null, b: null },
  historialFiltrar12: true,
  perfilOrigenMes: null,
  perfilOrigenAnio: null
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
    year: Number(f.year || new Date().getFullYear()),
    tiene_aire_acondicionado: Boolean(f.tiene_aire_acondicionado),
    tiene_calentador: Boolean(f.tiene_calentador),
    tiene_iluminacion_led: Boolean(f.tiene_iluminacion_led)
  };
  if (f.numero_personas) body.numero_personas = Number(f.numero_personas);
  if (f.antiguedad_electrodomesticos) body.antiguedad_electrodomesticos = f.antiguedad_electrodomesticos;
  if (f.tarifa_electrica !== '' && f.tarifa_electrica != null) body.tarifa_electrica = Number(f.tarifa_electrica);
  return body;
}
