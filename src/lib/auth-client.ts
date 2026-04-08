import { createAuthClient } from 'better-auth/react'

import { apiBaseUrl } from '@/lib/api-base-url'

const betterAuthBaseUrl =
  import.meta.env.VITE_BETTER_AUTH_URL?.trim() || apiBaseUrl || undefined

export const authClient = createAuthClient({
  ...(betterAuthBaseUrl ? { baseURL: betterAuthBaseUrl } : {}),
  basePath: '/api/auth',
})
