/**
 * Configuración del frontend EnergiAI
 * Módulo ES6
 */

export const CONFIG = {
  API_BASE: (() => {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    return 'https://146.181.33.44:8080';
  })(),
  OAUTH_ENABLED: true,
  VERSION: '2.1.0',
  GOOGLE_CLIENT_ID: '330192952305-2a8kp3djq5fj1akc3ncl9tl4u1m4dkfa.apps.googleusercontent.com'
};

export const KEYS = {
  token: 'energiai.token',
  email: 'energiai.email',
  nombre: 'energiai.nombre',
  theme: 'energiai-theme',
  set: 'energiai-set',
  next: 'energiai.next',
  result: 'energiai.result',
  form: 'energiai.form',
  authError: 'energiai.authError'
};

export const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const ANTIGUEDADES = [
  'menor a 3 años',
  'menor a 5 años',
  'menor a 10 años',
  'mayor a 10 años'
];

export const CAT = {
  EFICIENTE: 'Eficiente',
  MODERADO: 'Moderado',
  INEFICIENTE: 'Ineficiente'
};

export const WIZARD = [
  { key: 'tipo_inmueble', title: '¿Qué tipo de vivienda es?' },
  { key: 'month', title: '¿De qué mes es la factura?' },
  { key: 'uso_horario_pico', title: '¿Usas horario pico?' },
  { key: 'horas_alto_consumo', title: '¿Cuántas horas de alto consumo por día?' },
  { key: 'cantidad_equipos', title: '¿Cuántos equipos hay?' },
  { key: 'consumo_mensual', title: '¿Cuántos kWh consumiste en el mes?' },
  { key: 'numero_personas', title: '¿Cuántas personas viven ahí? (opcional)' },
  { key: 'tarifa_electrica', title: '¿Cuál es tu tarifa por kWh? (opcional)' },
  { key: 'antiguedad_electrodomesticos', title: 'Antigüedad de los equipos (opcional)' },
  { key: 'flags', title: '¿Qué equipos tienes?' }
];
