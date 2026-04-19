import type { Page, Route } from '@playwright/test'

const now = '2026-04-11T10:00:00.000Z'

export const expenseTrip = {
  id: 'trip-expense-1',
  title: '京都初春散策',
  location: '京都 · 日本',
  startDate: '2026-03-18T00:00:00.000Z',
  endDate: '2026-03-24T00:00:00.000Z',
  mode: 'expense',
  createdAt: now,
  memberships: [
    {
      id: 'membership-a',
      tripId: 'trip-expense-1',
      userId: 'user-a',
      createdAt: now,
      user: {
        id: 'user-a',
        email: 'alice@example.com',
        name: 'Alice',
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
      },
    },
    {
      id: 'membership-b',
      tripId: 'trip-expense-1',
      userId: 'user-b',
      createdAt: now,
      user: {
        id: 'user-b',
        email: 'mina@example.com',
        name: 'Mina',
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
      },
    },
  ],
  expenses: [
    {
      id: 'expense-1',
      tripId: 'trip-expense-1',
      title: '町家早餐',
      amount: 1260,
      date: '2026-03-19T00:00:00.000Z',
      splitType: 'equal_all',
      payerMembershipId: 'membership-a',
      note: null,
      createdAt: now,
      splits: [
        {
          id: 'split-1',
          expenseId: 'expense-1',
          membershipId: 'membership-a',
          amount: 630,
          createdAt: now,
        },
        {
          id: 'split-2',
          expenseId: 'expense-1',
          membershipId: 'membership-b',
          amount: 630,
          createdAt: now,
        },
      ],
    },
  ],
  contributions: [],
}

export const poolTrip = {
  id: 'trip-pool-1',
  title: '沖繩海風小旅行',
  location: '沖繩 · 日本',
  startDate: '2026-06-11T00:00:00.000Z',
  endDate: '2026-06-15T00:00:00.000Z',
  mode: 'pool',
  createdAt: now,
  memberships: [
    {
      id: 'membership-c',
      tripId: 'trip-pool-1',
      userId: 'user-c',
      createdAt: now,
      user: {
        id: 'user-c',
        email: 'ari@example.com',
        name: 'Ari',
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
      },
    },
    {
      id: 'membership-d',
      tripId: 'trip-pool-1',
      userId: 'user-d',
      createdAt: now,
      user: {
        id: 'user-d',
        email: 'sora@example.com',
        name: 'Sora',
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
      },
    },
    {
      id: 'membership-e',
      tripId: 'trip-pool-1',
      userId: 'user-e',
      createdAt: now,
      user: {
        id: 'user-e',
        email: 'nori@example.com',
        name: 'Nori',
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
      },
    },
  ],
  expenses: [
    {
      id: 'expense-2',
      tripId: 'trip-pool-1',
      title: '浮潛行程',
      amount: 4200,
      date: '2026-06-12T00:00:00.000Z',
      splitType: 'equal_all',
      payerMembershipId: null,
      note: null,
      createdAt: now,
      splits: [
        {
          id: 'split-3',
          expenseId: 'expense-2',
          membershipId: 'membership-c',
          amount: 1400,
          createdAt: now,
        },
        {
          id: 'split-4',
          expenseId: 'expense-2',
          membershipId: 'membership-d',
          amount: 1400,
          createdAt: now,
        },
        {
          id: 'split-5',
          expenseId: 'expense-2',
          membershipId: 'membership-e',
          amount: 1400,
          createdAt: now,
        },
      ],
    },
    {
      id: 'expense-3',
      tripId: 'trip-pool-1',
      title: '租車加油',
      amount: 1800,
      date: '2026-06-13T00:00:00.000Z',
      splitType: 'equal_all',
      payerMembershipId: null,
      note: null,
      createdAt: now,
      splits: [
        {
          id: 'split-6',
          expenseId: 'expense-3',
          membershipId: 'membership-c',
          amount: 600,
          createdAt: now,
        },
        {
          id: 'split-7',
          expenseId: 'expense-3',
          membershipId: 'membership-d',
          amount: 600,
          createdAt: now,
        },
        {
          id: 'split-8',
          expenseId: 'expense-3',
          membershipId: 'membership-e',
          amount: 600,
          createdAt: now,
        },
      ],
    },
  ],
  contributions: [
    {
      id: 'contribution-1',
      tripId: 'trip-pool-1',
      membershipId: 'membership-c',
      amount: 1200,
      date: '2026-06-11T00:00:00.000Z',
      createdAt: now,
    },
    {
      id: 'contribution-2',
      tripId: 'trip-pool-1',
      membershipId: 'membership-d',
      amount: 1200,
      date: '2026-06-11T00:00:00.000Z',
      createdAt: now,
    },
    {
      id: 'contribution-3',
      tripId: 'trip-pool-1',
      membershipId: 'membership-e',
      amount: 1000,
      date: '2026-06-11T00:00:00.000Z',
      createdAt: now,
    },
  ],
}

const trips = [expenseTrip, poolTrip]

const settlements = {
  [expenseTrip.id]: {
    tripId: expenseTrip.id,
    mode: 'expense',
    transfers: [],
  },
  [poolTrip.id]: {
    tripId: poolTrip.id,
    mode: 'pool',
    transfers: [],
  },
} as const

const invitationByToken = {
  'invite-expense': {
    id: 'invitation-1',
    tripId: expenseTrip.id,
    token: 'invite-expense',
    role: 'editor',
    maxUses: null,
    usedCount: 0,
    expiresAt: null,
    acceptedAt: null,
    revokedAt: null,
    createdByUserId: 'user-a',
    createdAt: now,
    trip: {
      id: expenseTrip.id,
      title: expenseTrip.title,
      location: expenseTrip.location,
      startDate: expenseTrip.startDate,
      endDate: expenseTrip.endDate,
      mode: expenseTrip.mode,
      createdAt: expenseTrip.createdAt,
    },
  },
} as const

type MockUser = {
  id: string
  email: string
  name: string
  emailVerified: boolean
  image: null
  createdAt: string
  updatedAt: string
}

function buildSession(user: MockUser) {
  return {
    session: {
      id: 'session-1',
      token: 'session-token',
      userId: user.id,
      expiresAt: '2026-04-18T10:00:00.000Z',
      createdAt: now,
      updatedAt: now,
    },
    user,
  }
}

async function fulfillJson(route: Route, status: number, data: unknown) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  })
}

function parseBody(requestBody: string | null) {
  if (!requestBody) {
    return {}
  }

  try {
    return JSON.parse(requestBody) as Record<string, unknown>
  } catch {
    return Object.fromEntries(new URLSearchParams(requestBody))
  }
}

export async function mockAppApi(
  page: Page,
  options: {
    authenticated?: boolean
  } = {},
) {
  let generatedInvitationCount = 0
  let currentUser: MockUser | null = options.authenticated
    ? {
        id: 'signed-in-user',
        email: 'traveler@example.com',
        name: '旅伴測試者',
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
      }
    : null

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname
    const method = route.request().method()

    if (!path.startsWith('/api/')) {
      await route.continue()
      return
    }

    if (path === '/api/auth/get-session') {
      await fulfillJson(route, 200, currentUser ? buildSession(currentUser) : null)
      return
    }

    if (path === '/api/auth/sign-up/email' && method === 'POST') {
      const body = parseBody(route.request().postData())
      const email = String(body.email ?? '')
      const name = String(body.name ?? '')

      if (email === 'taken@example.com') {
        await fulfillJson(route, 422, {
          message: 'User already exists. Use another email.',
          code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
        })
        return
      }

      currentUser = {
        id: 'new-user',
        email,
        name,
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
      }
      await fulfillJson(route, 200, {
        token: 'session-token',
        user: currentUser,
      })
      return
    }

    if (path === '/api/auth/sign-in/email' && method === 'POST') {
      const body = parseBody(route.request().postData())
      const email = String(body.email ?? '')

      if (email === 'wrong@example.com') {
        await fulfillJson(route, 401, {
          message: 'Invalid email or password',
          code: 'INVALID_EMAIL_OR_PASSWORD',
        })
        return
      }

      currentUser = {
        id: 'signed-in-user',
        email,
        name: '已登入使用者',
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
      }
      await fulfillJson(route, 200, {
        redirect: false,
        token: 'session-token',
        url: null,
        user: currentUser,
      })
      return
    }

    if (path === '/api/auth/sign-out' && method === 'POST') {
      currentUser = null
      await fulfillJson(route, 200, { success: true })
      return
    }

    if (path === '/api/trips' && method === 'GET') {
      await fulfillJson(route, 200, trips)
      return
    }

    if (path.startsWith('/api/trips/') && method === 'GET') {
      const tripId = path.replace('/api/trips/', '')
      const trip = trips.find((item) => item.id === tripId)

      if (!trip) {
        await fulfillJson(route, 404, { message: 'Trip not found' })
        return
      }

      await fulfillJson(route, 200, trip)
      return
    }

    if (path.startsWith('/api/settlement/') && method === 'GET') {
      const tripId = path.replace('/api/settlement/', '')
      const settlement = settlements[tripId as keyof typeof settlements]

      if (!settlement) {
        await fulfillJson(route, 404, { message: 'Settlement not found' })
        return
      }

      await fulfillJson(route, 200, settlement)
      return
    }

    if (path === `/api/invitations/${expenseTrip.id}` && method === 'POST') {
      generatedInvitationCount += 1

      await fulfillJson(route, 201, {
        id: 'invitation-generated',
        tripId: expenseTrip.id,
        token: `generated-invite-token-${generatedInvitationCount}`,
        role: 'editor',
        maxUses: null,
        usedCount: 0,
        expiresAt: null,
        acceptedAt: null,
        revokedAt: null,
        createdByUserId: 'user-a',
        createdAt: now,
      })
      return
    }

    if (path.startsWith('/api/invitations/') && method === 'GET') {
      const token = path.replace('/api/invitations/', '')

      if (token === 'invite-expired') {
        await fulfillJson(route, 400, {
          code: 'bad_request',
          message: '邀請已過期',
        })
        return
      }

      const invitation = invitationByToken[token as keyof typeof invitationByToken]

      if (!invitation) {
        await fulfillJson(route, 404, { message: 'Invitation not found' })
        return
      }

      await fulfillJson(route, 200, invitation)
      return
    }

    if (path === '/api/invitations/invite-expense/accept' && method === 'POST') {
      if (!currentUser) {
        await fulfillJson(route, 401, { message: 'Unauthorized' })
        return
      }

      await fulfillJson(route, 201, {
        id: 'membership-new',
        tripId: expenseTrip.id,
        userId: currentUser.id,
        createdAt: now,
      })
      return
    }

    await fulfillJson(route, 500, {
      message: `Unhandled mock route: ${method} ${path}`,
    })
  })
}
