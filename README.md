# EnergiAI — Frontend

Frontend SPA modular para el analizador de eficiencia energética.

**Deploy:** https://energi-ai.netlify.app  
**Versión:** 2.4.0

## Desarrollo Local

```bash
# Servir con cualquier servidor HTTP
npx serve .
# o
python3 -m http.server 3000
```

Luego abrir http://localhost:3000

> **Nota:** El backend debe estar corriendo en `localhost:8080` para desarrollo local.

## Configuración

La URL de la API se configura automáticamente en `js/config.js`:

- **localhost** → `http://localhost:8080`
- **Producción** → Proxy via Netlify a `http://146.181.33.44:8080`

## Estructura (ES6 Modules)

```
├── index.html          # Entry point
├── oauth-callback.html # Callback OAuth
├── favicon.svg         # Ícono de pestaña
├── styles.css          # Estilos (paleta preservada)
├── js/
│   ├── app.js          # Entry point de módulos
│   ├── config.js       # Configuración y constantes
│   ├── state.js        # Estado global
│   ├── api.js          # Fetch, autenticación
│   ├── router.js       # Navegación SPA
│   ├── utils.js        # Funciones utilitarias
│   ├── components.js   # Componentes UI reutilizables
│   ├── i18n.js         # Internacionalización ES/EN
│   └── views/
│       ├── inicio.js     # Landing page
│       ├── analisis.js   # Formulario de factura
│       ├── resultados.js # Categoría + recomendaciones
│       ├── historial.js  # Gráfico de barras
│       ├── comparar.js   # Comparación entre períodos
│       └── entrar.js     # Login / Registro
├── img/                # Assets (logo, banner)
├── _redirects          # Netlify proxy + SPA routing
└── netlify.toml        # Configuración Netlify
```

## Características

### Formulario
- **Campos vacíos** con placeholders informativos (sin valores asumidos)
- **Validación** antes de enviar con mensajes claros
- **Selector de año/mes** con meses ya cargados deshabilitados
- **Perfil del hogar** precargado del análisis más reciente

### Sesión
- **Validación** de token al cargar la app
- **Logout** limpia localStorage y sessionStorage
- **Expiración automática** si el token es inválido

### Internacionalización
- **Switch ES/EN** junto al toggle de tema
- **Persistencia** en localStorage
- **Herencia** al login (se mantiene el idioma elegido)

### Accesibilidad
- **Vista accesible** con texto grande
- **Navegación por teclado**
- **Lector de pantalla** (botón "Escuchar")
- **Botones con alto contraste** en modo claro

### Historial
- **Gráfico de barras** interactivo
- **Filtro de últimos 12 meses** (checkbox)
- **Scroll horizontal** cuando hay muchos registros

### Comparación
- **Vista "Comparar"** para contrastar dos períodos
- **Diferencia de consumo**, costo y huella de carbono

## Flujo de Autenticación

1. **Login local:** Email + contraseña → JWT
2. **Google OAuth:** Google Sign-In SDK → `id_token` → Backend → JWT
3. **Sesión:** JWT guardado en `localStorage`, validado al iniciar

## Paleta de Colores

| Variable | Light | Dark |
|----------|-------|------|
| Navy | #203573 | #203573 |
| Royal | #3352a6 | #3352a6 |
| Forest | #038c33 | #3ddc84 |
| Mint | #3ddc84 | #3ddc84 |
| Fog | #f2f2f2 | #162452 |

## Changelog

### v2.4.0
- Switch de idioma ES/EN con banderas
- Favicon SVG (casita EnergiAI)
- Traducciones en vistas principales

### v2.3.0
- Filtro de últimos 12 meses en historial
- Perfil del hogar precargado desde historial
- Scroll horizontal en gráfico de barras

### v2.2.0
- Botones de accesibilidad visibles en modo claro
- Selector de año en formulario
- Validación de meses duplicados

### v2.1.0
- Modularización en ES6 modules
- Formulario con campos vacíos (sin valores asumidos)
- Vista "Comparar" para contrastar períodos
- Logout que limpia sessionStorage
