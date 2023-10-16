/** @type {import('next').NextConfig} */
const nextConfig = {
    // webpack: (config) => {
    //   config.resolve.alias['@ezkljs/verify'] = '@ezkljs/verify/dist/esm/index.js';
    //   return config;
    // },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Cross-Origin-Embedder-Policy',
              value: 'require-corp',
            },
            {
              key: 'Cross-Origin-Opener-Policy',
              value: 'same-origin',
            },
          ],
        },
      ];
    },
  };

module.exports = nextConfig
