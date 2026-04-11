import { createAuthClient } from 'better-auth/react'

import { apiBaseUrl } from '@/lib/api-base-url'

const betterAuthBaseUrl =
  import.meta.env.VITE_BETTER_AUTH_URL?.trim() || apiBaseUrl || undefined

export const authClient = createAuthClient({
  ...(betterAuthBaseUrl ? { baseURL: betterAuthBaseUrl } : {}),
  basePath: '/api/auth',
  sessionOptions: {
    refetchOnWindowFocus: false,
    refetchInterval: 0,
  },
})

type AuthClientError = {
  code?: string
  message?: string
  status?: number
  statusText?: string
} | null | undefined

const authErrorCodeMessageMap = {
  USER_ALREADY_EXISTS: '此 Email 已註冊，請直接登入',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: '此 Email 已註冊，請直接登入',
  INVALID_EMAIL_OR_PASSWORD: 'Email 或密碼錯誤',
  INVALID_PASSWORD: 'Email 或密碼錯誤',
  USER_NOT_FOUND: 'Email 或密碼錯誤',
  CREDENTIAL_ACCOUNT_NOT_FOUND: 'Email 或密碼錯誤',
  EMAIL_NOT_VERIFIED: '此 Email 尚未完成驗證',
} as const

export const getAuthErrorMessage = (error: AuthClientError, fallback: string) => {
  if (!error) {
    return fallback
  }

  if (error.code && error.code in authErrorCodeMessageMap) {
    return authErrorCodeMessageMap[error.code as keyof typeof authErrorCodeMessageMap]
  }

  return error.message ?? fallback
}
