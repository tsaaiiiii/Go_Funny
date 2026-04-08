export interface MockSession {
  user: {
    email: string
    name: string
  }
}

const storageKey = 'mock-auth-session'

export function isMockAuthEnabled() {
  if (import.meta.env.DEV) {
    return true
  }

  if (typeof window === 'undefined') {
    return false
  }

  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
}

export function readMockSession() {
  if (typeof window === 'undefined' || !isMockAuthEnabled()) {
    return null
  }

  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored ? (JSON.parse(stored) as MockSession) : null
  } catch {
    return null
  }
}

export function writeMockSession(session: MockSession) {
  if (typeof window === 'undefined' || !isMockAuthEnabled()) {
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(session))
}
