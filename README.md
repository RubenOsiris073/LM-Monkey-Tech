# 🎽 Clasificador de Camisas con TensorFlow.js

Una aplicación web moderna para clasificar camisas por color usando machine learning directamente en el navegador.

## 🌟 Características

- **Entrenamiento personalizado** de modelos de deep learning
- **Clasificación en tiempo real** de imágenes de camisas
- **Optimizado para recursos limitados** (funciona en dispositivos con poca memoria)
- **Almacenamiento automático** del modelo entrenado
- **Interfaz moderna** con drag & drop
- **Sin servidor requerido** - todo funciona en el navegador

## 🏗️ Arquitectura del Proyecto

```
/workspaces/expo/
├── src/                          # Código fuente
│   ├── js/                       # JavaScript modular
│   │   ├── config/              # Configuraciones
│   │   │   └── config.js        # Configuración global
│   │   ├── modules/             # Módulos principales
│   │   │   ├── modelFactory.js  # Factory de modelos TF.js
│   │   │   ├── trainingEngine.js # Motor de entrenamiento
│   │   │   └── uiManager.js     # Gestor de interfaz
│   │   ├── utils/               # Utilidades
│   │   │   ├── imageUtils.js    # Manejo de imágenes
│   │   │   ├── memoryUtils.js   # Optimización de memoria
│   │   │   └── storageUtils.js  # Almacenamiento del modelo
│   │   └── train-app.js         # Aplicación principal
│   └── css/                     # Estilos
│       └── styles.css           # CSS principal
├── public/                      # Archivos públicos
│   └── train.html              # Página de entrenamiento
├── scripts/                    # Scripts de utilidad
│   └── setup_server.sh         # Configuración del servidor
├── docs/                       # Documentación
├── index.html                  # Página principal
├── package.json               # Configuración del proyecto
└── README.md                  # Este archivo
```

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js (opcional, para servidor de desarrollo)
- Navegador web moderno con soporte para ES6+ modules

### Instalación

1. **Clonar o descargar el proyecto**
```bash
git clone [tu-repositorio]
cd expo
```

2. **Instalar dependencias** (opcional)
```bash
npm install
```

3. **Ejecutar servidor de desarrollo**
```bash
npm run dev
# o
npm start
```

4. **Acceder a la aplicación**
   - Abrir `http://localhost:8080` en tu navegador
   - O abrir directamente `index.html` en el navegador

## 📖 Guía de Uso

### 1. Entrenar un Modelo

1. Ve a la página de entrenamiento (`train.html`)
2. Carga al menos 3 imágenes por cada categoría:
   - 🔴 Camisas rojas
   - ⚫ Camisas grises  
   - 🔵 Camisas azules
3. Ajusta los parámetros de entrenamiento si es necesario
4. Haz clic en "🚀 Entrenar Modelo"
5. Espera a que termine el entrenamiento (puede tomar varios minutos)

### 2. Clasificar Imágenes

1. Ve a la página principal (`index.html`)
2. Selecciona "Mi modelo personalizado" si has entrenado uno
3. Arrastra una imagen o haz clic para seleccionar
4. Haz clic en "🔍 Clasificar Camisa"
5. Ve los resultados con barras de confianza

## ⚙️ Configuración Técnica

### Parámetros del Modelo

- **Tamaño de imagen**: 32x32 píxeles (optimizado para memoria)
- **Arquitectura**: CNN simple con 1 capa convolucional
- **Clases**: 3 (roja, gris, azul)
- **Backend**: CPU (para compatibilidad máxima)

### Configuración de Entrenamiento

```javascript
// Valores por defecto optimizados
{
  epochs: 5,           // Épocas de entrenamiento
  batchSize: 2,        // Tamaño de lote pequeño
  learningRate: 0.01,  // Tasa de aprendizaje
  validationSplit: 0.1 // 10% para validación
}
```

## 🔧 Desarrollo

### Estructura Modular

El código está organizado en módulos ES6 para mejor mantenibilidad:

- **config.js**: Todas las configuraciones centralizadas
- **modelFactory.js**: Creación y configuración de modelos
- **trainingEngine.js**: Lógica principal de entrenamiento
- **uiManager.js**: Manejo de la interfaz de usuario
- **Utils**: Utilidades especializadas para imágenes, memoria y almacenamiento

### Optimizaciones Implementadas

1. **Memoria**:
   - Limpieza automática de tensores
   - Modelo ultra-compacto para localStorage
   - Gestión inteligente de memoria

2. **Rendimiento**:
   - Backend CPU forzado
   - Batch sizes pequeños
   - Imágenes de baja resolución

3. **Almacenamiento**:
   - IndexedDB como primera opción
   - localStorage como fallback
   - Modelo compacto para espacios limitados

### Agregar Nuevas Características

1. **Nueva clase de camisa**:
   - Actualizar `CONFIG.MODEL.CLASSES` en `config.js`
   - Agregar elementos UI correspondientes
   - Actualizar la lógica de preparación de datos

2. **Nuevo modelo**:
   - Agregar método en `ModelFactory`
   - Configurar en `CONFIG.TRAINING.OPTIMIZED`

## 🐛 Resolución de Problemas

### Problemas Comunes

1. **"Error cargando modelo"**
   - Verifica que el modelo fue entrenado correctamente
   - Revisa la consola del navegador para más detalles
   - Intenta entrenar un nuevo modelo

2. **"Sin modelo disponible"**
   - Ve a la página de entrenamiento
   - Entrena un modelo con al menos 3 imágenes por clase

3. **Rendimiento lento**
   - Reduce el número de imágenes de entrenamiento
   - Usa imágenes más pequeñas
   - Verifica que esté usando el backend CPU

4. **Error de memoria**
   - Recarga la página
   - Reduce el tamaño de lote
   - Usa menos imágenes por categoría

### Logs y Debugging

El sistema incluye logging detallado en la consola del navegador:

```javascript
// Habilitar logs detallados
localStorage.setItem('debug', 'true');
```

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama para nueva característica
3. Commit con mensaje descriptivo
4. Push a la rama
5. Crear Pull Request

## 📝 Licencia

MIT License - ver archivo LICENSE para detalles

## 🛠️ Tecnologías Utilizadas

- **TensorFlow.js 4.15.0** - Machine learning en el navegador
- **JavaScript ES6+** - Programación moderna y modular
- **HTML5 Canvas** - Procesamiento de imágenes
- **CSS3** - Interfaz moderna con gradientes
- **IndexedDB/localStorage** - Almacenamiento local del modelo

## 📊 Métricas y Rendimiento

- **Tamaño del modelo**: ~50KB (compacto)
- **Tiempo de entrenamiento**: 2-5 minutos (15-30 imágenes)
- **Tiempo de clasificación**: <1 segundo
- **Precisión esperada**: 70-90% (depende de calidad de datos)

## 🔮 Roadmap

- [ ] Soporte para más tipos de ropa
- [ ] Modelo preentrenado incluido
- [ ] Exportación de datasets
- [ ] Métricas de evaluación avanzadas
- [ ] Interfaz de administración de modelos
- [ ] Soporte para transfer learning

---

**Desarrollado con ❤️ usando TensorFlow.js**
