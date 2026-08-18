# EnergiAI — Frontend

Frontend SPA modular para el analizador de eficiencia energética.

**Deploy:** https://energi-ai.netlify.app  
**Versión:** 2.1.0

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
- **Producción** → URL configurada (actualmente `https://146.181.33.44:8080`)

## Estructura (ES6 Modules)

```
├── index.html          # Entry point
├── styles.css          # Estilos (paleta preservada)
├── js/
│   ├── app.js          # Entry point de módulos
│   ├── config.js       # Configuración y constantes
│   ├── state.js        # Estado global
│   ├── api.js          # Fetch, autenticación
│   ├── router.js       # Navegación SPA
│   ├── utils.js        # Funciones utilitarias
│   ├── components.js   # Componentes UI reutilizables
│   └── views/
│       ├── inicio.js   # Landing page
│       ├── analisis.js # Formulario de factura
│       ├── resultados.js # Categoría + recomendaciones
│       ├── historial.js  # Gráfico de barras
│       └── entrar.js     # Login / Registro
├── img/                # Assets (logo, banner)
├── _redirects          # Netlify SPA routing
└── netlify.toml        # Configuración Netlify
```

## Características

### Formulario
- **Campos vacíos** con placeholders informativos (sin valores asumidos)
- **Validación** antes de enviar con mensajes claros
- **No restauración automática** del formulario desde caché

### Sesión
- **Validación** de token al cargar la app
- **Logout** limpia localStorage y sessionStorage
- **Expiración automática** si el token es inválido

### Accesibilidad
- **Vista accesible** con texto grande
- **Navegación por teclado**
- **Lector de pantalla** (botón "Escuchar")

## Flujo de Autenticación

1. **Login local:** Email + contraseña → JWT
2. **Google OAuth:** Redirect → Backend → JWT en hash
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

### v2.1.0
- Modularización en ES6 modules
- Formulario con campos vacíos (sin valores asumidos)
- Validación antes de enviar
- Logout que limpia sessionStorage
- No restauración automática del formulario
