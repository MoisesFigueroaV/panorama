/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bflgrsdkjdyyeutafacc.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
       {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
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
