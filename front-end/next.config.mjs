/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Excluir Leaflet del SSR
      config.externals = config.externals || [];
      config.externals.push({
        'leaflet': 'commonjs leaflet',
        'react-leaflet': 'commonjs react-leaflet'
      });
    }
    return config;
  },
}

export default nextConfig
