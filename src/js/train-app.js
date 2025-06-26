/**
 * Aplicación de entrenamiento de modelos
 * Archivo principal que inicializa el motor de entrenamiento
 */

import { TrainingEngine } from './modules/trainingEngine.js';
import { MemoryUtils } from './utils/memoryUtils.js';

/**
 * Clase principal de la aplicación de entrenamiento
 */
class TrainingApp {
    constructor() {
        this.trainingEngine = null;
        this.isInitialized = false;
    }

    /**
     * Inicializa la aplicación
     */
    async initialize() {
        try {
            console.log('🚀 Inicializando aplicación de entrenamiento...');
            
            // Configurar TensorFlow.js
            await MemoryUtils.setupTensorFlow();
            
            // Inicializar motor de entrenamiento
            this.trainingEngine = new TrainingEngine();
            await this.trainingEngine.initialize();
            
            this.isInitialized = true;
            console.log('✅ Aplicación de entrenamiento inicializada correctamente');
            
            // Reportar memoria inicial
            MemoryUtils.reportMemoryUsage();
            
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            this.showError('Error inicializando la aplicación. Recarga la página.');
        }
    }

    /**
     * Muestra un error en la interfaz
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f44336;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        errorDiv.innerHTML = `
            <h3>❌ Error</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #f44336;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            ">Recargar Página</button>
        `;
        document.body.appendChild(errorDiv);
    }

    /**
     * Limpia recursos antes de cerrar
     */
    cleanup() {
        if (this.trainingEngine) {
            this.trainingEngine.cleanupTrainingData();
        }
        MemoryUtils.cleanupMemory();
        console.log('🧹 Recursos limpiados');
    }
}

// Instancia global de la aplicación
let trainingApp = null;

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', async () => {
    trainingApp = new TrainingApp();
    await trainingApp.initialize();
});

/**
 * Limpiar recursos al cerrar la página
 */
window.addEventListener('beforeunload', () => {
    if (trainingApp) {
        trainingApp.cleanup();
    }
});

/**
 * Manejar errores no capturados
 */
window.addEventListener('error', (event) => {
    console.error('Error no capturado:', event.error);
    if (trainingApp) {
        trainingApp.showError('Ocurrió un error inesperado. Verifica la consola para más detalles.');
    }
});

// Exportar para uso en módulos
export default trainingApp;
