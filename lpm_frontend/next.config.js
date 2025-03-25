const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/home'
      },
      {
        source: '/api/:path*', // Ensure source starts with `/api/`
        destination: 'https://user:4b08c68edcd7e31c6c5348cc0c06bb2b@second-me-app-tunnel-1cj46i1n.devinapps.com/api/:path*' // Updated to use deployed backend
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date'
          },
          { key: 'Accept', value: 'text/event-stream' },
          { key: 'Cache-Control', value: 'no-cache' },
          { key: 'Connection', value: 'keep-alive' }
        ]
      }
    ];
  },
  experimental: {
    proxyTimeout: 0 // Disable proxy timeout
  },
  compiler: {
    styledComponents: true
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'canvas', 'jsdom'];

    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300
    };

    return config;
  }
};

module.exports = nextConfig;
