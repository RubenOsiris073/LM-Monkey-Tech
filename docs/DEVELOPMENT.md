# Configuración de desarrollo

## Servidor de desarrollo

Para desarrollo local, puedes usar cualquiera de estos comandos:

```bash
# Con live-server (recarga automática)
npm run dev

# Con http-server (más estable)
npm start

# Con Python (si tienes Python instalado)
python -m http.server 8080

# Con Node.js (si tienes Node.js)
npx serve .
```

## Variables de entorno

Puedes configurar el comportamiento de la aplicación usando localStorage:

```javascript
// Habilitar logs detallados
localStorage.setItem('debug', 'true');

// Forzar backend específico
localStorage.setItem('tfBackend', 'cpu'); // o 'webgl'

// Configurar memoria máxima (MB)
localStorage.setItem('maxMemory', '100');
```

## Estructura de archivos durante desarrollo

```
src/
├── js/
│   ├── config/          # ✅ Configuraciones centralizadas
│   ├── modules/         # ✅ Lógica de negocio modular
│   ├── utils/           # ✅ Utilidades reutilizables
│   └── *.js            # ✅ Scripts principales
├── css/                 # ✅ Estilos organizados
└── assets/             # 📁 Imágenes, iconos (futuro)
```

## Convenciones de código

- **ES6 Modules**: Usar import/export
- **Async/Await**: Para operaciones asíncronas
- **Console logging**: Con prefijos descriptivos
- **Error handling**: Try-catch con mensajes informativos
- **Memory management**: Limpiar tensores explícitamente

## Performance Tips

1. **Desarrollo**:
   - Usar pocos datos de prueba
   - Backend CPU para debugging
   - Logs habilitados

2. **Producción**:
   - Optimizar imágenes
   - Minimizar logs
   - Usar WebGL si está disponible
