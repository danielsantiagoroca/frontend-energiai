/**
 * Configuración del frontend EnergiAI
 * 
 * API_BASE se determina automáticamente según el entorno:
 * - localhost → backend local en :8080
 * - Netlify → backend en OCI (cambiar URL cuando esté disponible)
 */

const CONFIG = {
  // URL base de la API
  API_BASE: (() => {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    // TODO: Cambiar por la URL real del backend en producción
    return 'https://146.181.33.44:8080';
  })(),

  // OAuth habilitado
  OAUTH_ENABLED: true,

  // Versión del frontend
  VERSION: '2.0.0',

  // Keys de localStorage/sessionStorage
  KEYS: {
    token: 'energiai.token',
    email: 'energiai.email',
    nombre: 'energiai.nombre',
    theme: 'energiai-theme',
    set: 'energiai-set',
    next: 'energiai.next',
    result: 'energiai.result',
    form: 'energiai.form',
    authError: 'energiai.authError'
  }
};

// Hacer disponible globalmente
window.CONFIG = CONFIG;
