interface Env {
  API_PROXY_TARGET?: string
}

const defaultProxyTarget = 'https://go-funny-backend.onrender.com'

const normalizeBaseUrl = (value?: string) => {
  return value?.trim().replace(/\/+$/, '') || defaultProxyTarget
}

const rewritePathname = (pathname: string) => {
  if (pathname.startsWith('/api/auth')) {
    return pathname
  }

  return pathname.replace(/^\/api(?=\/|$)/, '') || '/'
}

export const onRequest = async ({
  request,
  env,
}: {
  request: Request
  env: Env
}) => {
  const incomingUrl = new URL(request.url)
  const targetUrl = new URL(
    rewritePathname(incomingUrl.pathname),
    normalizeBaseUrl(env.API_PROXY_TARGET),
  )

  targetUrl.search = incomingUrl.search

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.set('x-forwarded-host', incomingUrl.host)
  headers.set('x-forwarded-proto', incomingUrl.protocol.replace(':', ''))

  return fetch(targetUrl.toString(), {
    method: request.method,
    headers,
    redirect: 'manual',
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
  })
}
