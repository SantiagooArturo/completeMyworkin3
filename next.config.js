/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  
  // ✅ Optimizaciones de Performance
  compress: true,
  poweredByHeader: false,
  
  // ✅ Optimización de imágenes
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['firebasestorage.googleapis.com'],
  },
  
  trailingSlash: true,
  
  // ✅ Configuración de Webpack optimizada
  webpack: (config, { isServer, dev }) => {
    // Para Firebase Admin SDK
    if (isServer) {
      config.externals.push({
        'firebase-admin': 'commonjs firebase-admin',
      });
    }

    // ✅ Optimizaciones de Bundle
    if (!dev && !isServer) {
      // Code splitting optimizado
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: 'vendor',
              chunks: 'all',
              priority: 10,
            },
            ui: {
              test: /[\\/]node_modules[\\/](@headlessui|@heroicons)[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 9,
            },
            firebase: {
              test: /[\\/]node_modules[\\/]firebase[\\/]/,
              name: 'firebase',
              chunks: 'all',
              priority: 8,
            },
            pdf: {
              test: /[\\/]node_modules[\\/](jspdf|html2canvas)[\\/]/,
              name: 'pdf',
              chunks: 'all',
              priority: 7,
            },
            common: {
              minChunks: 2,
              name: 'common',
              chunks: 'all',
              priority: 5,
            },
          },
        },
      };

      // Tree shaking optimizado
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // ✅ Optimizaciones de resolución
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': './components',
      '@services': './services',
      '@utils': './utils',
      '@lib': './lib',
      '@types': './types',
    };

    return config;
  },
  
  // ✅ Headers de performance y seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/analizar-cv',
        destination: 'https://api-cv-myworkin.onrender.com/analizar-cv/',
      },
    ];
  },
  
  // ✅ Configuración experimental para performance
  experimental: {
    // Optimización de CSS
    optimizeCss: true,
    // Optimización de fuentes
    optimizePackageImports: ['@headlessui/react', '@heroicons/react'],
  },

  // ✅ Paquetes externos del servidor (movido de experimental)
  serverExternalPackages: ['firebase-admin'],

  // ✅ Configuración de TypeScript
  typescript: {
    // Tipos estrictos en producción
    ignoreBuildErrors: false,
  },

  // ✅ Configuración de ESLint
  eslint: {
    // Lint estricto en build
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig 