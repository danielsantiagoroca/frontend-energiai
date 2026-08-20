/**
 * Vista: Análisis / Formulario
 */

import { state, labelPerfilOrigen } from '../state.js';
import { MESES, ANTIGUEDADES, WIZARD, YEARS } from '../config.js';
import { esc, periodoOcupado } from '../utils.js';
import { chromeA11y, chromeId, headerId, alertBox } from '../components.js';
import { t, tMonth } from '../i18n.js';

function tipoLabel(tipo) {
  const map = { 'Casa': t('analisis.casa'), 'Departamento': t('analisis.departamento'), 'Monoambiente': t('analisis.monoambiente') };
  return map[tipo] || tipo;
}

function tile(tipo) {
  const on = state.form.tipo_inmueble === tipo ? ' on' : '';
  return `<button class="tile${on}" type="button" data-tipo="${tipo}">
    <div class="caption">${t('analisis.tipoVivienda')}</div><h3>${tipoLabel(tipo)}</h3>
  </button>`;
}

function wizardBody(step) {
  const f = state.form;
  switch (step.key) {
    case 'tipo_inmueble':
      return `<div class="stack">${tile('Casa')}${tile('Departamento')}${tile('Monoambiente')}</div>`;
    case 'month':
      return `<div class="stack">${MESES.slice(1).map((m, i) =>
        `<button class="choice${String(i + 1) === String(f.month) ? ' on' : ''}" type="button" data-field="month" data-value="${i + 1}">${m}</button>`).join('')}</div>`;
    case 'uso_horario_pico':
      return `<div class="stack">
        <button class="choice${f.uso_horario_pico === 'si' ? ' on' : ''}" type="button" data-field="uso_horario_pico" data-value="si">Sí</button>
        <button class="choice${f.uso_horario_pico === 'no' ? ' on' : ''}" type="button" data-field="uso_horario_pico" data-value="no">No</button>
      </div>`;
    case 'horas_alto_consumo':
      return `<div class="field-ctl"><label for="horas_alto_consumo">Horas (0–24)</label>
        <input id="horas_alto_consumo" name="horas_alto_consumo" type="number" min="0" max="24" step="0.5" value="${esc(f.horas_alto_consumo)}"></div>`;
    case 'cantidad_equipos':
      return `<div class="field-ctl"><label for="cantidad_equipos">Equipos (0–50)</label>
        <input id="cantidad_equipos" name="cantidad_equipos" type="number" min="0" max="50" step="1" value="${esc(f.cantidad_equipos)}"></div>`;
    case 'consumo_mensual':
      return `<div class="field-ctl"><label for="consumo_mensual">kWh (80–1200)</label>
        <input id="consumo_mensual" name="consumo_mensual" type="number" min="80" max="1200" step="1" value="${esc(f.consumo_mensual)}"></div>`;
    case 'numero_personas':
      return `<div class="field-ctl"><label for="numero_personas">Personas</label>
        <input id="numero_personas" name="numero_personas" type="number" min="1" step="1" value="${esc(f.numero_personas)}"></div>`;
    case 'tarifa_electrica':
      return `<div class="field-ctl"><label for="tarifa_electrica">Tarifa</label>
        <input id="tarifa_electrica" name="tarifa_electrica" type="number" min="0" step="0.01" value="${esc(f.tarifa_electrica)}"></div>`;
    case 'antiguedad_electrodomesticos':
      return `<div class="stack">
        <button class="choice${!f.antiguedad_electrodomesticos ? ' on' : ''}" type="button" data-field="antiguedad_electrodomesticos" data-value="">Prefiero no decirlo</button>
        ${ANTIGUEDADES.map((a) => `<button class="choice${a === f.antiguedad_electrodomesticos ? ' on' : ''}" type="button" data-field="antiguedad_electrodomesticos" data-value="${esc(a)}">${esc(a)}</button>`).join('')}
        <p>Si lo indicás, estimamos un indicador de huella (kg CO2e). Si preferís no decirlo, el resto del diagnóstico sigue igual.</p>
      </div>`;
    case 'flags':
      return `<div class="checks">
        <label class="check"><input type="checkbox" name="tiene_calentador"${f.tiene_calentador ? ' checked' : ''}> Calentador / calefacción eléctrica</label>
        <label class="check"><input type="checkbox" name="tiene_aire_acondicionado"${f.tiene_aire_acondicionado ? ' checked' : ''}> Aire acondicionado</label>
        <label class="check"><input type="checkbox" name="tiene_iluminacion_led"${f.tiene_iluminacion_led ? ' checked' : ''}> Iluminación LED</label>
        ${state.auth ? `<label class="check"><input type="checkbox" name="guardar"${f.guardar ? ' checked' : ''}> Guardar en historial</label>` : ''}
      </div>`;
    default:
      return '';
  }
}

function renderAnalisisWizard() {
  const i = Math.min(state.wizardStep, WIZARD.length - 1);
  const step = WIZARD[i];
  const last = i === WIZARD.length - 1;
  const dots = WIZARD.map((_, n) => `<i class="${n <= i ? 'on' : ''}"></i>`).join('');
  return `
    ${chromeA11y()}
    <div class="main" id="contenido">
      <p class="caption">Paso ${i + 1} de ${WIZARD.length}</p>
      <div class="progress" aria-hidden="true">${dots}</div>
      <h1>${esc(step.title)}</h1>
      ${alertBox()}
      ${wizardBody(step)}
      <div class="cta-row">
        ${i > 0 ? `<button class="btn ghost" type="button" data-action="wizard-back">Anterior</button>` : ''}
        ${last
          ? `<button class="btn navy" type="button" data-action="analizar" ${state.loading ? 'disabled' : ''}>${state.loading ? 'Calculando…' : 'Calcular perfil'}</button>`
          : `<button class="btn navy" type="button" data-action="wizard-next">Siguiente</button>`}
      </div>
    </div>`;
}

export function renderAnalisis() {
  if (state.set === 'a11y') return renderAnalisisWizard();
  const f = state.form;
  const logged = Boolean(state.auth);
  const a11y = state.set === 'a11y';
  const tienePerfilGuardado = f.tipo_inmueble || f.cantidad_equipos;
  const perfilLabel = labelPerfilOrigen();
  const perfilHint = perfilLabel 
    ? `<span class="hint">(${t('analisis.de')} ${perfilLabel})</span>` 
    : (tienePerfilGuardado ? `<span class="hint">${t('analisis.recordado')}</span>` : '');
  return `
    ${a11y ? chromeA11y() : chromeId()}
    <div class="main" id="contenido">
      ${a11y ? '' : headerId()}
      <h1>${state.lang === 'en' ? 'Build your home pulse' : 'Armá el pulso de tu hogar'}</h1>
      <p>${state.lang === 'en' 
        ? (logged ? 'Fill in your bill data. Your analysis will be saved to history.' : 'Fill in your bill data. Without an account, the result is not saved.')
        : (logged ? 'Completá los datos de tu factura. Tu análisis se guardará en el historial.' : 'Completá los datos de tu factura. Sin cuenta, el resultado no se guarda.')}</p>
      ${alertBox()}
      
      <h2 class="section-title">${t('analisis.titulo')}</h2>
      <div class="fields">
        <div class="field-ctl"><label for="year">${t('analisis.anio')}</label>
          <select id="year" name="year" required>
            ${YEARS.map((y) => `<option value="${y}"${Number(y) === Number(f.year) ? ' selected' : ''}>${y}</option>`).join('')}
          </select>
        </div>
        <div class="field-ctl"><label for="month">${t('analisis.mesFact')}</label>
          <select id="month" name="month" required>
            <option value=""${!f.month ? ' selected' : ''} disabled>${state.lang === 'en' ? 'Select month' : 'Seleccioná el mes'}</option>
            ${MESES.slice(1).map((m, i) => {
              const ocupado = periodoOcupado(String(i + 1), f.year);
              return `<option value="${i + 1}"${String(i + 1) === String(f.month) ? ' selected' : ''}${ocupado ? ' disabled' : ''}>${tMonth(i + 1)}${ocupado ? ' ' + t('analisis.mesCargado') : ''}</option>`;
            }).join('')}</select>
        </div>
        <div class="field-ctl"><label for="consumo_mensual">${t('analisis.consumoMensual')}</label>
          <input id="consumo_mensual" name="consumo_mensual" type="number" min="80" max="1200" step="1" value="${esc(f.consumo_mensual)}" placeholder="${state.lang === 'en' ? 'From your bill (80-1200)' : 'Según tu factura (80-1200)'}" required>
        </div>
        <div class="field-ctl"><label for="uso_horario_pico">${t('analisis.horarioPico')}</label>
          <select id="uso_horario_pico" name="uso_horario_pico" required>
            <option value=""${!f.uso_horario_pico ? ' selected' : ''} disabled>${state.lang === 'en' ? 'Select' : 'Seleccioná'}</option>
            <option value="no"${f.uso_horario_pico === 'no' ? ' selected' : ''}>${t('analisis.no')}</option>
            <option value="si"${f.uso_horario_pico === 'si' ? ' selected' : ''}>${t('analisis.si')}</option>
          </select>
        </div>
        <div class="field-ctl"><label for="horas_alto_consumo">${t('analisis.horasAlto')}</label>
          <input id="horas_alto_consumo" name="horas_alto_consumo" type="number" min="0" max="24" step="0.5" value="${esc(f.horas_alto_consumo)}" placeholder="${state.lang === 'en' ? 'E.g.: 6' : 'Ej: 6'}" required>
        </div>
      </div>
      
      <h2 class="section-title">${t('analisis.perfilHogar')}${perfilHint ? ' ' + perfilHint : ''}</h2>
      <div class="tiles">
        ${tile('Casa')}${tile('Departamento')}${tile('Monoambiente')}
      </div>
      <div class="fields">
        <div class="field-ctl"><label for="cantidad_equipos">${t('analisis.cantEquipos')}</label>
          <input id="cantidad_equipos" name="cantidad_equipos" type="number" min="0" max="50" step="1" value="${esc(f.cantidad_equipos)}" placeholder="${state.lang === 'en' ? 'E.g.: 8' : 'Ej: 8'}" required>
        </div>
        <div class="field-ctl"><label for="antiguedad_electrodomesticos">${t('analisis.antiguedad')}</label>
          <select id="antiguedad_electrodomesticos" name="antiguedad_electrodomesticos">
            <option value=""${!f.antiguedad_electrodomesticos ? ' selected' : ''}>${state.lang === 'en' ? 'Not specified' : 'No especificar'}</option>
            <option value="menor a 3 años"${'menor a 3 años' === f.antiguedad_electrodomesticos ? ' selected' : ''}>${t('analisis.menor3')}</option>
            <option value="menor a 5 años"${'menor a 5 años' === f.antiguedad_electrodomesticos ? ' selected' : ''}>${t('analisis.menor5')}</option>
            <option value="menor a 10 años"${'menor a 10 años' === f.antiguedad_electrodomesticos ? ' selected' : ''}>${t('analisis.menor10')}</option>
            <option value="mayor a 10 años"${'mayor a 10 años' === f.antiguedad_electrodomesticos ? ' selected' : ''}>${t('analisis.mayor10')}</option>
          </select>
        </div>
        <div class="field-ctl"><label for="numero_personas">${t('analisis.personas')}</label>
          <input id="numero_personas" name="numero_personas" type="number" min="1" step="1" value="${esc(f.numero_personas)}" placeholder="${state.lang === 'en' ? 'Optional' : 'Opcional'}">
        </div>
        <div class="field-ctl"><label for="tarifa_electrica">${t('analisis.tarifa')}</label>
          <input id="tarifa_electrica" name="tarifa_electrica" type="number" min="0" step="0.01" value="${esc(f.tarifa_electrica)}" placeholder="${state.lang === 'en' ? 'E.g.: 0.75' : 'Ej: 0.75'}">
        </div>
      </div>
      <div class="checks">
        <label class="check"><input type="checkbox" name="tiene_aire_acondicionado"${f.tiene_aire_acondicionado ? ' checked' : ''}> ${t('analisis.ac')}</label>
        <label class="check"><input type="checkbox" name="tiene_iluminacion_led"${f.tiene_iluminacion_led ? ' checked' : ''}> ${t('analisis.led')}</label>
        <label class="check"><input type="checkbox" name="tiene_calentador"${f.tiene_calentador ? ' checked' : ''}> ${t('analisis.calentador')}</label>
        ${logged ? `<label class="check"><input type="checkbox" name="guardar"${f.guardar ? ' checked' : ''}> ${t('analisis.guardarCheck')}</label>`
          : `<p class="caption" style="text-transform:none">${state.lang === 'en' ? 'To save:' : 'Para guardar:'} <button class="link" type="button" data-action="login" data-next="#analisis">${t('auth.entrar').toLowerCase()}</button>.</p>`}
      </div>
      <div class="cta-row">
        <button class="btn primary" type="button" data-action="analizar" ${state.loading ? 'disabled' : ''}>
          ${state.loading ? t('analisis.calculando') : t('analisis.calcular')}
        </button>
      </div>
    </div>`;
}
