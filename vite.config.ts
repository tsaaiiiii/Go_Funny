import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL?.trim()
  const proxyTarget = env.VITE_PROXY_TARGET?.trim() || 'https://go-funny-backend.onrender.com'
  const proxyPrefixes = ['/api/auth', '/trips', '/members', '/expenses', '/contributions', '/settlement', '/invitations']

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: apiBaseUrl
        ? undefined
        : Object.fromEntries(
            proxyPrefixes.map((prefix) => [
              prefix,
              {
                target: proxyTarget,
                changeOrigin: true,
              },
            ]),
          ),
    },
  }
})
