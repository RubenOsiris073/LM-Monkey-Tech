# Guía de Imágenes para Entrenamiento ML

## 📊 **Recomendaciones de Imágenes por Escenario**

### **🎯 Mínimos del Sistema (Ya configurados)**
```typescript
// En trainingValidationService.ts
- Mínimo absoluto: 3 imágenes por clase
- Mínimo total: 10 imágenes
- Balance máximo: 5:1 entre clases
```

### **📈 Recomendaciones Prácticas**

#### **🥉 Básico - Pruebas y Desarrollo**
- **Por clase**: 10-15 imágenes
- **Total**: 20-45 imágenes (2-3 clases)
- **Resultado esperado**: 60-70% accuracy
- **Uso**: Validar el sistema, pruebas rápidas

#### **🥈 Intermedio - Uso Real**
- **Por clase**: 25-50 imágenes  
- **Total**: 50-200 imágenes (2-4 clases)
- **Resultado esperado**: 75-85% accuracy
- **Uso**: Aplicaciones reales con tolerancia a errores

#### **🥇 Óptimo - Producción**
- **Por clase**: 50-100 imágenes
- **Total**: 100-500 imágenes (2-5 clases)
- **Resultado esperado**: 85-95% accuracy
- **Uso**: Aplicaciones críticas, producción

#### **🏆 Profesional - Alta Precisión**
- **Por clase**: 100+ imágenes
- **Total**: 500+ imágenes (múltiples clases)
- **Resultado esperado**: 90-95%+ accuracy
- **Uso**: Sistemas comerciales, alta confiabilidad

## 🔍 **Factores que Afectan la Precisión**

### **1. Configuración Actual del Sistema**
```typescript
// El target accuracy se ajusta automáticamente:
targetAccuracy = Math.min(0.95, 0.85 + (totalImages / 1000))

// Ejemplos:
// 50 imágenes  → target: 89%
// 100 imágenes → target: 89.5%
// 200 imágenes → target: 90.5%
// 500 imágenes → target: 93.5%
```

### **2. Épocas de Entrenamiento**
```typescript
// Se ajustan automáticamente según datos:
épocas = 15 + (totalImages > 200 ? 10 : 0) + (numClasses > 5 ? 5 : 0)

// 50 imágenes  → 15 épocas
// 250 imágenes → 25 épocas  
// 300 imágenes + 6 clases → 30 épocas (máximo)
```

## 🎨 **Calidad vs Cantidad de Imágenes**

### **✅ Imágenes de Alta Calidad**
- **Resolución**: Mínimo 224x224 (se redimensiona automáticamente)
- **Variedad**: Diferentes ángulos, iluminación, fondos
- **Claridad**: Objeto principal bien definido
- **Formato**: Base64 válido (validado automáticamente)

### **📸 Diversidad Recomendada por Clase**
- **Ángulos**: Frontal, lateral, diagonal (mín. 3)
- **Iluminación**: Natural, artificial, sombras
- **Fondos**: Variados pero sin distraer del objeto
- **Escalas**: Objeto cerca, lejos, diferentes tamaños

## 🚀 **Estrategia Progresiva Recomendada**

### **Fase 1: Prototipo (20-50 imágenes)**
```typescript
// Configuración actual es perfecta para esto
2-3 clases × 10-15 imágenes = 20-45 imágenes
Tiempo entrenamiento: ~5-10 minutos
Accuracy esperada: 65-75%
```

### **Fase 2: MVP (50-150 imágenes)**
```typescript
3-4 clases × 15-35 imágenes = 50-140 imágenes
Tiempo entrenamiento: ~10-15 minutos
Accuracy esperada: 75-85%
```

### **Fase 3: Producción (100-500 imágenes)**
```typescript
4-5 clases × 25-100 imágenes = 100-500 imágenes
Tiempo entrenamiento: ~15-30 minutos
Accuracy esperada: 85-95%
```

## ⚙️ **Ajustes para Optimizar con Menos Imágenes**

Si quieres mejorar la precisión con menos imágenes, puedes ajustar:

### **1. Aumentar Épocas Mínimas**
```typescript
// En trainingExecutorService.ts → calculateOptimalEpochs()
let epochs = 20; // Cambiar de 15 a 20
```

### **2. Reducir Dropout**
```typescript
// En modelGeneratorService.ts → generateModelTopology()
rate: 0.3 // Cambiar de 0.5 a 0.3 para menos regularización
```

### **3. Ajustar Learning Rate**
```typescript
// En modelGeneratorService.ts → generateModelMetadata()
learningRate: 0.0005 // Reducir para convergencia más estable
```

## 📊 **Tabla de Referencia Rápida**

| Escenario | Imágenes/Clase | Total | Accuracy | Tiempo | Uso |
|-----------|----------------|-------|----------|--------|-----|
| **Pruebas** | 10-15 | 20-45 | 60-70% | 5-10 min | Desarrollo |
| **MVP** | 25-50 | 50-200 | 75-85% | 10-15 min | Aplicación real |
| **Producción** | 50-100 | 100-500 | 85-95% | 15-30 min | Crítico |
| **Comercial** | 100+ | 500+ | 90%+ | 30+ min | Alta precisión |

## 🎯 **Recomendación Final**

Para tu sistema actual, te recomiendo empezar con:

**🎯 30-50 imágenes totales (3-4 clases × 10-15 imágenes)**
- Es suficiente para ver resultados reales
- El sistema está optimizado para este rango
- Permite iteración rápida
- Accuracy esperada: 70-80%

Una vez que valides que todo funciona, puedes escalar gradualmente agregando más imágenes para mejorar la precisión.

## 📋 **Checklist de Calidad de Imágenes**

### ✅ **Antes de Entrenar**
- [ ] Mínimo 3 imágenes por clase
- [ ] Balance entre clases no mayor a 5:1
- [ ] Imágenes en formato Base64 válido
- [ ] Resolución mínima 224x224
- [ ] Variedad de ángulos e iluminación
- [ ] Objeto principal claramente visible
- [ ] Fondos variados pero no distractores

### ✅ **Para Mejorar Resultados**
- [ ] Agregar más imágenes gradualmente
- [ ] Mantener balance entre clases
- [ ] Incluir casos edge (diferentes condiciones)
- [ ] Validar con imágenes de prueba independientes
- [ ] Monitorear métricas de validation vs training
