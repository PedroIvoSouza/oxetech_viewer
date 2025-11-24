/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Otimizações para reduzir uso de memória durante build
  webpack: (config, { isServer, dev }) => {
    // Limita o número de workers para reduzir uso de memória
    config.optimization = {
      ...config.optimization,
      minimize: !dev, // Só minifica em produção
    };
    
    // Reduz cache para economizar memória
    config.cache = {
      type: 'filesystem',
      maxMemoryGenerations: 1,
      buildDependencies: {
        config: [__filename],
      },
    };
    
    // Em desenvolvimento, reduz paralelismo para economizar memória
    if (dev) {
      config.parallelism = 1;
    }
    
    return config;
  },
  // Desabilita geração de source maps em produção para economizar memória
  productionBrowserSourceMaps: false,
  // Limita o número de workers do SWC
  swcMinify: true,
  // Compressão otimizada
  compress: true,
  // Desabilita análise estática pesada durante build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Otimizações para desenvolvimento
  ...(process.env.NODE_ENV === 'development' && {
    // Reduz uso de memória em desenvolvimento
    onDemandEntries: {
      maxInactiveAge: 60 * 1000, // 1 minuto
      pagesBufferLength: 5, // Mantém apenas 5 páginas em memória
    },
  }),
}

export default nextConfig
