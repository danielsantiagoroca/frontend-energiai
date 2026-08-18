# Plan de Reestructuración — Frontend EnergiAI

**Dominio de despliegue:** https://energi-ai.netlify.app  
**Repo:** `danielsantiagoroca/frontend-energiai`  
**API Backend:** https://energiai-api.example.com (a configurar)

---

## 1. Paleta de Colores (Preservar)

```css
/* Light Theme */
--royal: #3352a6;      /* Azul intermedio */
--navy: #203573;       /* Azul oscuro principal */
--forest: #038c33;     /* Verde oscuro */
--mint: #3ddc84;       /* Verde claro / acento */
--fog: #f2f2f2;        /* Fondo claro */
--white: #ffffff;
--muted: #6b7280;      /* Texto secundario */
--line: #d5d8e0;       /* Bordes */

/* Dark Theme */
--bg: #162452;         /* Fondo oscuro */
--surface: #203573;    /* Superficies */
--accent: #3ddc84;     /* Acento verde */
```

---

## 2. Disposición de Pantallas (Preservar)

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGACIÓN                               │
├─────────────────────────────────────────────────────────────────┤
│  [Inicio] [Análisis] [Resultados] [Historial]    [Entrar/Salir] │
└─────────────────────────────────────────────────────────────────┘

PANTALLAS:
├── #inicio      → Landing con CTA "Comenzar análisis"
├── #analisis    → Formulario de factura
├── #resultados  → Categoría + costo + recomendaciones
├── #historial   → Gráfico de barras (requiere auth)
└── #entrar      → Login / Registro / Google OAuth
```

---

## 3. Problemas Actuales a Resolver

### 3.1 Formularios con valores asumidos

**Problema:** `defaultForm()` tiene valores hardcodeados que confunden al usuario.

```javascript
// ACTUAL (problemático)
function defaultForm() {
  return {
    tipo_inmueble: "Casa",        // ❌ Asume Casa
    consumo_mensual: "240",       // ❌ Asume 240 kWh
    cantidad_equipos: "8",        // ❌ Asume 8 equipos
    // ...
  };
}
```

**Solución:** Formulario vacío con placeholders informativos.

```javascript
// PROPUESTO
function defaultForm() {
  return {
    tipo_inmueble: "",            // Vacío, seleccionar
    month: "",                    // Vacío, seleccionar
    uso_horario_pico: "",         // Vacío, seleccionar
    horas_alto_consumo: "",       // Vacío
    cantidad_equipos: "",         // Vacío
    consumo_mensual: "",          // Vacío
    numero_personas: "",          // Opcional
    tiene_aire_acondicionado: false,
    tiene_calentador: false,
    tiene_iluminacion_led: false,
    antiguedad_electrodomesticos: "",
    tarifa_electrica: "",         // Opcional
    guardar: true                 // Default a guardar si está logueado
  };
}
```

### 3.2 Caché de sesión que persiste datos viejos

**Problema:** `sessionStorage` mantiene formularios entre recargas.

**Solución:**
1. NO restaurar formulario automáticamente
2. Limpiar sessionStorage en logout
3. Ofrecer "Continuar donde dejaste" explícitamente

```javascript
// PROPUESTO
function restoreSession() {
  // Solo restaurar resultado si existe Y el usuario está logueado
  if (state.auth) {
    const r = sessionStorage.getItem(KEYS.result);
    if (r) state.result = sanitizeResult(JSON.parse(r));
  }
  // NO restaurar formulario automáticamente
}

function logout() {
  expireSession();
  sessionStorage.removeItem(KEYS.form);
  sessionStorage.removeItem(KEYS.result);
  state.form = defaultForm();  // Reset a vacío
  go("inicio");
}
```

### 3.3 Sesión no validada al cargar

**Problema:** Se asume que el token en localStorage es válido.

**Solución:** Validar sesión con el backend al cargar.

```javascript
// PROPUESTO
async function initApp() {
  ingestOAuthHash();
  
  if (state.auth?.token) {
    const valid = await probeSession();
    if (!valid) {
      expireSession();
      state.notice = "Tu sesión expiró. Volvé a entrar.";
    }
  }
  
  onRoute();
}
```

---

## 4. Estructura de Archivos Propuesta

```
frontend-energiai/
├── index.html              # Entry point (SPA)
├── styles.css              # Estilos (paleta actual)
├── app.js                  # Lógica principal
├── config.js               # Configuración (API URL, etc.)
├── img/
│   ├── logo-mark.png
│   └── logo-banner.svg
├── _redirects              # Netlify: SPA routing
├── netlify.toml            # Configuración Netlify
└── README.md
```

### 4.1 Archivo `config.js`

```javascript
// config.js
const CONFIG = {
  API_BASE: window.location.hostname === 'localhost' 
    ? 'http://localhost:8080'
    : 'https://api.energi-ai.example.com',  // Cambiar por URL real
  
  OAUTH_ENABLED: true,
  VERSION: '2.0.0'
};

export default CONFIG;
```

### 4.2 Archivo `_redirects` (Netlify SPA)

```
/*    /index.html   200
```

### 4.3 Archivo `netlify.toml`

```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## 5. Flujo de Sesión Revisado

```
┌─────────────────────────────────────────────────────────────────┐
│                      CARGA DE LA APP                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ ¿Hash con token?│ (OAuth callback)
                    └────────┬────────┘
                        Sí   │   No
                   ┌─────────┴─────────┐
                   ▼                   ▼
         ┌─────────────────┐  ┌─────────────────┐
         │ ingestOAuthHash │  │ ¿Token en       │
         │ Guardar en LS   │  │ localStorage?   │
         └────────┬────────┘  └────────┬────────┘
                  │                Sí   │   No
                  │           ┌────────┴────────┐
                  │           ▼                 ▼
                  │  ┌─────────────────┐  ┌─────────────┐
                  │  │ probeSession()  │  │ Usuario     │
                  │  │ Validar con API │  │ anónimo     │
                  │  └────────┬────────┘  └─────────────┘
                  │      OK   │   401
                  │  ┌────────┴────────┐
                  │  ▼                 ▼
                  │  ┌──────────┐  ┌──────────────┐
                  │  │ Sesión   │  │ expireSession│
                  │  │ activa   │  │ Limpiar LS   │
                  │  └──────────┘  └──────────────┘
                  │        │              │
                  └────────┴──────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    onRoute()    │
                    │ Renderizar view │
                    └─────────────────┘
```

---

## 6. Validación de Formulario

### 6.1 Campos Requeridos

| Campo | Tipo | Validación |
|-------|------|------------|
| `tipo_inmueble` | select | Requerido: Casa/Departamento/Monoambiente |
| `month` | select | Requerido: 1-12 |
| `uso_horario_pico` | select | Requerido: si/no |
| `horas_alto_consumo` | number | Requerido: 0-24 |
| `cantidad_equipos` | number | Requerido: 0-50 |
| `consumo_mensual` | number | Requerido: 80-1200 |

### 6.2 Campos Opcionales

| Campo | Tipo | Default |
|-------|------|---------|
| `numero_personas` | number | (vacío) |
| `tarifa_electrica` | number | (vacío, API usa default) |
| `antiguedad_electrodomesticos` | select | (vacío) |
| `tiene_*` | boolean | false |

### 6.3 UX de Validación

```javascript
function validateForm() {
  const f = state.form;
  const errors = [];
  
  if (!f.tipo_inmueble) errors.push("Seleccioná el tipo de vivienda");
  if (!f.month) errors.push("Seleccioná el mes de la factura");
  if (!f.uso_horario_pico) errors.push("Indicá si usás horario pico");
  if (!f.horas_alto_consumo) errors.push("Ingresá las horas de alto consumo");
  if (!f.cantidad_equipos) errors.push("Ingresá la cantidad de equipos");
  if (!f.consumo_mensual) errors.push("Ingresá el consumo mensual");
  
  const consumo = Number(f.consumo_mensual);
  if (f.consumo_mensual && (consumo < 80 || consumo > 1200)) {
    errors.push("El consumo debe estar entre 80 y 1200 kWh");
  }
  
  return errors;
}
```

---

## 7. Tareas de Implementación

### Fase 1: Preparar Repo (1-2 horas)
- [ ] Copiar archivos estáticos al repo `frontend-energiai`
- [ ] Crear `config.js` con API URL configurable
- [ ] Crear `_redirects` y `netlify.toml`
- [ ] Configurar CORS en el backend para el dominio Netlify

### Fase 2: Refactorizar Sesión (2-3 horas)
- [ ] Modificar `defaultForm()` para valores vacíos
- [ ] Actualizar `restoreSession()` para no restaurar formulario
- [ ] Mejorar `logout()` para limpiar sessionStorage
- [ ] Agregar validación de sesión al iniciar

### Fase 3: Validación de Formulario (1-2 horas)
- [ ] Implementar `validateForm()`
- [ ] Mostrar errores inline en cada campo
- [ ] Deshabilitar "Calcular" si hay errores
- [ ] Agregar placeholders descriptivos

### Fase 4: Testing y Deploy (1-2 horas)
- [ ] Probar flujo completo local
- [ ] Probar OAuth con URL de Netlify
- [ ] Agregar dominio en Google Console
- [ ] Deploy a Netlify

---

## 8. Configuración Backend para CORS

Agregar el dominio de Netlify en `application.yml`:

```yaml
app:
  cors:
    allowed-origins: >
      http://localhost:5173,
      http://localhost:3000,
      https://energi-ai.netlify.app
```

---

## 9. Configuración Google OAuth

En Google Cloud Console, agregar:

**Authorized JavaScript origins:**
```
https://energi-ai.netlify.app
```

**Authorized redirect URIs:**
```
https://energi-ai.netlify.app/oauth-callback.html
```

**Nota:** El frontend en Netlify necesitará un flujo OAuth diferente (API-based) ya que no puede usar el redirect de Spring Security directamente. Opciones:

1. **Proxy a través del backend:** Netlify → Backend → Google → Backend → Netlify
2. **OAuth directo con Google SDK:** Frontend obtiene `id_token`, lo envía a `/api/auth/oauth/google`

La opción 2 es más limpia para SPA.

---

## 10. Próximos Pasos

1. **Revisar este plan** y confirmar alcance
2. **Decidir estrategia OAuth** para SPA (recomiendo opción 2)
3. **Configurar CORS** en el backend
4. **Implementar cambios** fase por fase
5. **Deploy y testing** en Netlify
