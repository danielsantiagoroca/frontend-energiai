# EnergiAI — Frontend

Frontend SPA para el analizador de eficiencia energética.

**Deploy:** https://energi-ai.netlify.app

## Desarrollo Local

```bash
# Servir con cualquier servidor HTTP
npx serve .
# o
python3 -m http.server 3000
```

Luego abrir http://localhost:3000

## Configuración

Editar `config.js` para cambiar la URL de la API:

```javascript
API_BASE: 'http://localhost:8080'  // Desarrollo
API_BASE: 'https://api.energi-ai.com'  // Producción
```

## Estructura

```
├── index.html      # Entry point
├── app.js          # Lógica principal
├── styles.css      # Estilos
├── config.js       # Configuración
├── img/            # Assets
├── _redirects      # Netlify SPA routing
└── netlify.toml    # Configuración Netlify
```

## Flujo de Autenticación

1. **Login local:** Email + contraseña → JWT
2. **Google OAuth:** Google SDK → `id_token` → `/api/auth/oauth/google` → JWT
3. **Sesión:** JWT guardado en `localStorage`

## Paleta de Colores

| Variable | Light | Dark |
|----------|-------|------|
| Navy | #203573 | #203573 |
| Royal | #3352a6 | #3352a6 |
| Forest | #038c33 | #3ddc84 |
| Mint | #3ddc84 | #3ddc84 |
| Fog | #f2f2f2 | #162452 |
