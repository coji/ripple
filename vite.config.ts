import {
  cloudflareDevProxyVitePlugin,
  vitePlugin as remix,
} from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    cloudflareDevProxyVitePlugin(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        unstable_lazyRouteDiscovery: true,
        unstable_singleFetch: true,
      },
    }),
    tsconfigPaths(),
  ],
  ssr: { resolve: { conditions: ['workerd', 'worker', 'browser'] } },
  resolve: { mainFields: ['browser', 'module', 'main'] },
  build: {
    minify: true,
  },
})
