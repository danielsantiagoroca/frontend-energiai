/**
 * Internacionalización ES/EN
 */

import { KEYS } from './config.js';

export const TEXTS = {
  // === GENERAL ===
  'app.name': { es: 'EnergiAI', en: 'EnergiAI' },
  'app.copyright': { es: '© 2026 EnergiAI', en: '© 2026 EnergiAI' },
  
  // === NAVEGACIÓN ===
  'nav.inicio': { es: 'Inicio', en: 'Home' },
  'nav.analisis': { es: 'Análisis', en: 'Analysis' },
  'nav.resultados': { es: 'Resultados', en: 'Results' },
  'nav.historial': { es: 'Historial', en: 'History' },
  'nav.comparar': { es: 'Comparar', en: 'Compare' },
  'nav.accesible': { es: 'Accesible', en: 'Accessible' },
  'nav.vistaEstandar': { es: 'Vista estándar', en: 'Standard view' },
  
  // === AUTH ===
  'auth.entrar': { es: 'Entrar', en: 'Sign in' },
  'auth.salir': { es: 'Salir', en: 'Sign out' },
  'auth.crearCuenta': { es: 'Crear cuenta', en: 'Create account' },
  'auth.entrando': { es: 'Entrando…', en: 'Signing in…' },
  'auth.creando': { es: 'Creando…', en: 'Creating…' },
  'auth.nombre': { es: 'Nombre', en: 'Name' },
  'auth.email': { es: 'Email', en: 'Email' },
  'auth.password': { es: 'Contraseña', en: 'Password' },
  'auth.passwordMin': { es: 'Contraseña (mínimo 8)', en: 'Password (min 8)' },
  'auth.googleContinue': { es: 'Continuar con Google', en: 'Continue with Google' },
  'auth.tuCasa': { es: 'Tu casa, en claro.', en: 'Your home, clearly.' },
  'auth.creatuCuenta': { es: 'Creá tu cuenta.', en: 'Create your account.' },
  'auth.paraHistorial': { es: 'Entrá para ver el historial y guardar análisis. El diagnóstico que ya calculaste no se pierde.', en: 'Sign in to view history and save analyses. Your completed diagnosis is preserved.' },
  
  // === INICIO ===
  'inicio.kicker': { es: 'RED ENERGÉTICA · IA EN EL HOGAR', en: 'ENERGY NETWORK · HOME AI' },
  'inicio.headline': { es: 'Tu casa habla<br>en kilovatios.<br>Nosotros traducimos.', en: 'Your home speaks<br>in kilowatts.<br>We translate.' },
  'inicio.headlineA11y': { es: 'Analizá el consumo de tu casa, con texto grande.', en: 'Analyze your home consumption, with large text.' },
  'inicio.sub': { es: 'Diagnóstico con los datos de tu factura. Categoría, costo, huella de carbono y tres recomendaciones.', en: 'Diagnosis with your bill data. Category, cost, carbon footprint and three recommendations.' },
  'inicio.subA11y': { es: 'Completá los datos de tu factura. Sin cuenta ves tu categoría, costo y recomendaciones. Con cuenta se guarda el historial.', en: 'Fill in your bill data. Without an account you see your category, cost and recommendations. With an account, history is saved.' },
  'inicio.comenzar': { es: 'Comenzar análisis', en: 'Start analysis' },
  'inicio.empezar': { es: 'Empezar el análisis', en: 'Start analysis' },
  'inicio.verHistorial': { es: 'Ver historial', en: 'View history' },
  'inicio.entrarHistorial': { es: 'Entrar para el historial', en: 'Sign in for history' },
  'inicio.sesionActiva': { es: 'Sesión activa · podés guardar', en: 'Session active · you can save' },
  'inicio.sinCuenta': { es: '2 min · sin cuenta, o entrá para historial', en: '2 min · no account, or sign in for history' },
  'inicio.queVes': { es: 'Qué ves al terminar', en: 'What you see at the end' },
  'inicio.queVesDesc': { es: 'Tu categoría, costo estimado y 3 acciones para mejorar', en: 'Your category, estimated cost and 3 actions to improve' },
  'inicio.conCuentaDesc': { es: 'Con cuenta: historial y desglose detallado.', en: 'With account: history and detailed breakdown.' },
  'inicio.cardSinCuenta': { es: 'Sin cuenta', en: 'Without account' },
  'inicio.cardSinCuentaDesc': { es: 'Analizá tu consumo al instante. Ves tu categoría, costo y tres recomendaciones.', en: 'Analyze your consumption instantly. See your category, cost and three recommendations.' },
  'inicio.cardConCuenta': { es: 'Con cuenta', en: 'With account' },
  'inicio.cardConCuentaDesc': { es: 'Guardá tus análisis y seguí tu evolución mes a mes.', en: 'Save your analyses and track your evolution month by month.' },
  'inicio.cardRecomendaciones': { es: 'Recomendaciones', en: 'Recommendations' },
  'inicio.cardRecomendacionesDesc': { es: 'Tres acciones concretas para reducir tu consumo.', en: 'Three concrete actions to reduce your consumption.' },
  
  // === TEMA ===
  'theme.oscuro': { es: 'Modo oscuro', en: 'Dark mode' },
  'theme.claro': { es: 'Modo claro', en: 'Light mode' },
  
  // === A11Y ===
  'a11y.saltar': { es: 'Saltar al contenido', en: 'Skip to content' },
  'a11y.escuchar': { es: 'Escuchar', en: 'Listen' },
  
  // === ANÁLISIS ===
  'analisis.titulo': { es: 'Datos de la factura', en: 'Bill data' },
  'analisis.perfilHogar': { es: 'Perfil del hogar', en: 'Home profile' },
  'analisis.tipoVivienda': { es: '¿Qué tipo de vivienda es?', en: 'What type of home is it?' },
  'analisis.mesFact': { es: '¿De qué mes es la factura?', en: 'Which month is the bill from?' },
  'analisis.anio': { es: 'Año', en: 'Year' },
  'analisis.horarioPico': { es: '¿Usás horario pico? (17:00 a 22:00 hs)', en: 'Do you use peak hours? (5-10 PM)' },
  'analisis.horasAlto': { es: '¿Cuántas horas de alto consumo por día?', en: 'How many high consumption hours per day?' },
  'analisis.cantEquipos': { es: '¿Cuántos equipos hay?', en: 'How many appliances are there?' },
  'analisis.consumoMensual': { es: '¿Cuántos kWh consumiste en el mes?', en: 'How many kWh did you consume this month?' },
  'analisis.personas': { es: '¿Cuántas personas viven ahí? (opcional)', en: 'How many people live there? (optional)' },
  'analisis.tarifa': { es: '¿Cuál es tu tarifa por kWh? (opcional)', en: 'What is your rate per kWh? (optional)' },
  'analisis.antiguedad': { es: 'Antigüedad de los equipos (opcional)', en: 'Appliance age (optional)' },
  'analisis.equipos': { es: '¿Qué equipos tienes?', en: 'What appliances do you have?' },
  'analisis.calcular': { es: 'Calcular', en: 'Calculate' },
  'analisis.calculando': { es: 'Calculando…', en: 'Calculating…' },
  'analisis.guardarCheck': { es: 'Guardar en mi historial', en: 'Save to my history' },
  'analisis.casa': { es: 'Casa', en: 'House' },
  'analisis.departamento': { es: 'Departamento', en: 'Apartment' },
  'analisis.monoambiente': { es: 'Monoambiente', en: 'Studio' },
  'analisis.si': { es: 'Sí', en: 'Yes' },
  'analisis.no': { es: 'No', en: 'No' },
  'analisis.ac': { es: 'Aire acondicionado', en: 'Air conditioning' },
  'analisis.led': { es: 'Iluminación LED', en: 'LED lighting' },
  'analisis.calentador': { es: 'Calentador eléctrico', en: 'Electric heater' },
  'analisis.menor3': { es: 'menor a 3 años', en: 'less than 3 years' },
  'analisis.menor5': { es: 'menor a 5 años', en: 'less than 5 years' },
  'analisis.menor10': { es: 'menor a 10 años', en: 'less than 10 years' },
  'analisis.mayor10': { es: 'mayor a 10 años', en: 'more than 10 years' },
  'analisis.mesCargado': { es: '(cargado)', en: '(loaded)' },
  'analisis.recordado': { es: '(recordado)', en: '(remembered)' },
  'analisis.de': { es: 'de', en: 'from' },
  
  // === RESULTADOS ===
  'resultados.titulo': { es: 'Tu perfil energético', en: 'Your energy profile' },
  'resultados.consumo': { es: 'Consumo', en: 'Consumption' },
  'resultados.costoEst': { es: 'Costo estimado', en: 'Estimated cost' },
  'resultados.huella': { es: 'Huella de carbono', en: 'Carbon footprint' },
  'resultados.tendencia': { es: 'Tendencia', en: 'Trend' },
  'resultados.probabilidades': { es: 'Probabilidades', en: 'Probabilities' },
  'resultados.recomendaciones': { es: 'Recomendaciones', en: 'Recommendations' },
  'resultados.guardar': { es: 'Guardar análisis', en: 'Save analysis' },
  'resultados.entrarGuardar': { es: 'Entrar para guardar', en: 'Sign in to save' },
  'resultados.nuevoAnalisis': { es: 'Nuevo análisis', en: 'New analysis' },
  'resultados.verHistorial': { es: 'Ver historial', en: 'View history' },
  'resultados.sinResultado': { es: 'Todavía no hay un resultado', en: 'No result yet' },
  'resultados.completaAnalisis': { es: 'Completá un análisis o abrí una barra del historial.', en: 'Complete an analysis or open a bar from history.' },
  'resultados.irAnalisis': { es: 'Ir al análisis', en: 'Go to analysis' },
  'resultados.tuPerfil': { es: 'Tu perfil de consumo', en: 'Your consumption profile' },
  'resultados.mes': { es: 'mes', en: 'month' },
  'resultados.tresAcciones': { es: 'Tres acciones sugeridas', en: 'Three suggested actions' },
  'resultados.sinRecs': { es: 'Sin recomendaciones en este registro.', en: 'No recommendations for this record.' },
  'resultados.probCat': { es: 'Probabilidad por categoría', en: 'Probability by category' },
  'resultados.costoBase': { es: 'Costo base', en: 'Base cost' },
  'resultados.costoRecargos': { es: 'Costo con recargos', en: 'Cost with surcharges' },
  'resultados.estacion': { es: 'Estación', en: 'Season' },
  'resultados.recargoEstacion': { es: 'Recargo estacional', en: 'Seasonal surcharge' },
  'resultados.recargoPico': { es: 'Recargo horario pico', en: 'Peak hour surcharge' },
  'resultados.recargoLed': { es: 'Recargo sin LED', en: 'Non-LED surcharge' },
  'resultados.recargoAntiguos': { es: 'Recargo equipos antiguos', en: 'Old appliances surcharge' },
  'resultados.ahorroMes': { es: 'Ahorro posible / mes', en: 'Possible savings / month' },
  'resultados.ahorroAnio': { es: 'Ahorro posible / año', en: 'Possible savings / year' },
  'resultados.consumoPersona': { es: 'Consumo por persona', en: 'Consumption per person' },
  'resultados.analisisPrevios': { es: 'Análisis previos', en: 'Previous analyses' },
  'resultados.promedioAnterior': { es: 'Promedio anterior', en: 'Previous average' },
  'resultados.proyeccion': { es: 'Proyección por estación', en: 'Projection by season' },
  'resultados.actual': { es: 'actual', en: 'current' },
  'resultados.loginDesglose': { es: 'Entrá con tu cuenta para ver el desglose de costos y tu historial.', en: 'Sign in to see cost breakdown and your history.' },
  
  // === HISTORIAL ===
  'historial.titulo': { es: 'Tu historial', en: 'Your history' },
  'historial.vacio': { es: 'No hay análisis guardados todavía.', en: 'No saved analyses yet.' },
  'historial.filtro12': { es: 'Mostrar solo últimos 12 meses', en: 'Show only last 12 months' },
  'historial.total': { es: 'análisis en total', en: 'total analyses' },
  'historial.loginVer': { es: 'Entrá con tu cuenta para ver tus análisis guardados.', en: 'Sign in to view your saved analyses.' },
  'historial.volverResultados': { es: 'Volver a resultados', en: 'Back to results' },
  'historial.toca': { es: 'Tus análisis guardados. Tocá una barra para ver el detalle.', en: 'Your saved analyses. Tap a bar to see details.' },
  'historial.cargando': { es: 'Cargando…', en: 'Loading…' },
  
  // === COMPARAR ===
  'comparar.titulo': { es: 'Comparar períodos', en: 'Compare periods' },
  'comparar.periodo1': { es: 'Período inicial', en: 'Initial period' },
  'comparar.periodo2': { es: 'Período final', en: 'Final period' },
  'comparar.diff': { es: 'Diferencia', en: 'Difference' },
  'comparar.necesitas': { es: 'Necesitás al menos dos análisis guardados para comparar. Actualmente tenés {n}.', en: 'You need at least two saved analyses to compare. You currently have {n}.' },
  'comparar.selecciona': { es: 'Seleccioná un período', en: 'Select a period' },
  'comparar.loginVer': { es: 'Entrá con tu cuenta para comparar tu desempeño entre dos períodos.', en: 'Sign in to compare your performance between two periods.' },
  'comparar.volverInicio': { es: 'Volver al inicio', en: 'Back to home' },
  'comparar.hacerAnalisis': { es: 'Hacer un análisis', en: 'Make an analysis' },
  'comparar.seleccionaDos': { es: 'Seleccioná dos períodos para ver cómo evolucionó tu consumo.', en: 'Select two periods to see how your consumption evolved.' },
  'comparar.seleccionaArriba': { es: 'Seleccioná dos períodos arriba para ver la comparación.', en: 'Select two periods above to see the comparison.' },
  'comparar.verHistorialCompleto': { es: 'Ver historial completo', en: 'View full history' },
  'comparar.vsPeriodo': { es: 'vs período anterior', en: 'vs previous period' },
  'comparar.costo': { es: 'Costo', en: 'Cost' },
  'comparar.aumento': { es: 'Aumentó', en: 'Increased' },
  'comparar.disminuyo': { es: 'Disminuyó', en: 'Decreased' },
  'comparar.sinCambios': { es: 'Sin cambios', en: 'No changes' },
  'comparar.buenTrabajo': { es: '¡Buen trabajo! Redujiste tu consumo en {kwh} kWh ({pct}%).', en: 'Great job! You reduced your consumption by {kwh} kWh ({pct}%).' },
  'comparar.consumoAumento': { es: 'Tu consumo aumentó {kwh} kWh ({pct}%). Revisá las recomendaciones para mejorar.', en: 'Your consumption increased by {kwh} kWh ({pct}%). Check recommendations to improve.' },
  
  // === CATEGORÍAS ===
  'cat.eficiente': { es: 'Eficiente', en: 'Efficient' },
  'cat.moderado': { es: 'Moderado', en: 'Moderate' },
  'cat.ineficiente': { es: 'Ineficiente', en: 'Inefficient' },
  
  // === MESES ===
  'mes.1': { es: 'Enero', en: 'January' },
  'mes.2': { es: 'Febrero', en: 'February' },
  'mes.3': { es: 'Marzo', en: 'March' },
  'mes.4': { es: 'Abril', en: 'April' },
  'mes.5': { es: 'Mayo', en: 'May' },
  'mes.6': { es: 'Junio', en: 'June' },
  'mes.7': { es: 'Julio', en: 'July' },
  'mes.8': { es: 'Agosto', en: 'August' },
  'mes.9': { es: 'Septiembre', en: 'September' },
  'mes.10': { es: 'Octubre', en: 'October' },
  'mes.11': { es: 'Noviembre', en: 'November' },
  'mes.12': { es: 'Diciembre', en: 'December' },
  
  // === MESES CORTOS ===
  'mes.short.1': { es: 'Ene', en: 'Jan' },
  'mes.short.2': { es: 'Feb', en: 'Feb' },
  'mes.short.3': { es: 'Mar', en: 'Mar' },
  'mes.short.4': { es: 'Abr', en: 'Apr' },
  'mes.short.5': { es: 'May', en: 'May' },
  'mes.short.6': { es: 'Jun', en: 'Jun' },
  'mes.short.7': { es: 'Jul', en: 'Jul' },
  'mes.short.8': { es: 'Ago', en: 'Aug' },
  'mes.short.9': { es: 'Sep', en: 'Sep' },
  'mes.short.10': { es: 'Oct', en: 'Oct' },
  'mes.short.11': { es: 'Nov', en: 'Nov' },
  'mes.short.12': { es: 'Dic', en: 'Dec' },
  
  // === VALIDACIÓN ===
  'valid.tipoVivienda': { es: 'Seleccioná el tipo de vivienda', en: 'Select the home type' },
  'valid.mes': { es: 'Seleccioná el mes de la factura', en: 'Select the bill month' },
  'valid.horarioPico': { es: 'Indicá si usás horario pico', en: 'Indicate if you use peak hours' },
  'valid.horasAlto': { es: 'Ingresá las horas de alto consumo', en: 'Enter the high consumption hours' },
  'valid.equipos': { es: 'Ingresá la cantidad de equipos', en: 'Enter the number of appliances' },
  'valid.consumo': { es: 'Ingresá el consumo mensual', en: 'Enter the monthly consumption' },
  'valid.consumoRango': { es: 'El consumo debe estar entre 80 y 1200 kWh', en: 'Consumption must be between 80 and 1200 kWh' },

  // === TTS (Text-to-Speech) ===
  'speak.inicio': { es: 'EnergiAI. Analizá el consumo de tu casa. Podés empezar sin cuenta.', en: 'EnergiAI. Analyze your home energy consumption. You can start without an account.' },
  'speak.analisis': { es: 'Completá los datos de la factura y calculá el perfil.', en: 'Fill in the invoice data and calculate your profile.' },
  'speak.resultados': { es: 'Categoría {cat}.', en: 'Category {cat}.' },
  'speak.sin_resultado': { es: 'Todavía no hay un resultado.', en: 'No result yet.' },
  'speak.entrar': { es: 'Entrá para ver el historial o guardar el análisis.', en: 'Sign in to view history or save your analysis.' },
  'speak.historial': { es: 'Historial de análisis. Seleccioná un período para ver detalles.', en: 'Analysis history. Select a period to view details.' },
  'speak.comparar': { es: 'Compará dos períodos de consumo.', en: 'Compare two consumption periods.' },
};

let currentLang = localStorage.getItem(KEYS.lang) || 'es';

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  currentLang = lang;
  localStorage.setItem(KEYS.lang, lang);
}

export function t(key) {
  const entry = TEXTS[key];
  if (!entry) return key;
  return entry[currentLang] || entry.es || key;
}

export function tMonth(n) {
  return t(`mes.${n}`);
}

export function tMonthShort(n) {
  return t(`mes.short.${n}`);
}
