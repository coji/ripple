import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { createRequestHandler, type ServerBuild } from '@remix-run/cloudflare'
import __STATIC_CONTENT_MANIFEST from '__STATIC_CONTENT_MANIFEST'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import * as build from './build/server'

const MANIFEST = JSON.parse(__STATIC_CONTENT_MANIFEST)
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const handleRemixRequest = createRequestHandler(build as any as ServerBuild)

export default {
  async fetch(request, env, ctx) {
    const waitUntil = ctx.waitUntil.bind(ctx)
    const passThroughOnException = ctx.passThroughOnException.bind(ctx)
    try {
      const url = new URL(request.url)
      const ttl = url.pathname.startsWith('/assets/')
        ? 60 * 60 * 24 * 365 // 1 year
        : 60 * 5 // 5 minutes
      return await getAssetFromKV(
        { request, waitUntil },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: MANIFEST,
          cacheControl: {
            browserTTL: ttl,
            edgeTTL: ttl,
          },
        },
      )
    } catch (error) {
      // No-op
    }

    try {
      const loadContext = {
        cloudflare: {
          // This object matches the return value from Wrangler's
          // `getPlatformProxy` used during development via Remix's
          // `cloudflareDevProxyVitePlugin`:
          // https://developers.cloudflare.com/workers/wrangler/api/#getplatformproxy
          cf: request.cf,
          ctx: { waitUntil, passThroughOnException },
          caches,
          env,
        },
      }
      return await handleRemixRequest(request, loadContext)
    } catch (error) {
      console.log(error)
      return new Response('An unexpected error occurred', { status: 500 })
    }
  },
} satisfies ExportedHandler<Env & { __STATIC_CONTENT: KVNamespace<string> }>
