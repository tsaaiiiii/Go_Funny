const normalizeBaseUrl = (value?: string) => {
  return value?.trim().replace(/\/+$/, '') || ''
}

export const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)

export const buildApiUrl = (path: string) => {
  return apiBaseUrl ? `${apiBaseUrl}${path}` : `/api${path}`
}
