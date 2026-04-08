import { buildApiUrl } from '@/lib/api-base-url'

export type ErrorType<Error> = Error
export type BodyType<BodyData> = BodyData

export async function customFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const requestUrl = /^https?:\/\//.test(url) ? url : buildApiUrl(url)

  const response = await fetch(requestUrl, {
    ...options,
    credentials: 'include',
  })

  const body = [204, 205, 304].includes(response.status) ? null : await response.text()
  const data = body ? JSON.parse(body) : {}

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T
}
