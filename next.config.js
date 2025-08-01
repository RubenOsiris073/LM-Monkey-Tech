/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para paquetes externos en el servidor
  serverExternalPackages: ['@tensorflow/tfjs-node', 'sharp'],
  
  // Aumentar límites para el entrenamiento con muchas imágenes
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Permitir hasta 100MB para las peticiones
    },
  },
  api: {
    bodyParser: {
      sizeLimit: '100mb', // También aumentar el límite para la API routes
    },
    responseLimit: '100mb',
  },
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Configuración específica para TensorFlow.js en el servidor
      config.externals.push({
        '@tensorflow/tfjs-node': 'commonjs @tensorflow/tfjs-node',
      });
    } else {
      // Para el cliente, usar la versión web de TensorFlow.js
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  // Configurar para imágenes y archivos estáticos
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
};

module.exports = nextConfig;
