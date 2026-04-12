export interface MockSession {
  user: {
    id: string
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
    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored) as Partial<MockSession>
    const email = parsed.user?.email?.trim()
    const name = parsed.user?.name?.trim()

    if (!email || !name) {
      return null
    }

    return {
      user: {
        id: parsed.user?.id?.trim() || email,
        email,
        name,
      },
    }
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

export function clearMockSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(storageKey)
}
