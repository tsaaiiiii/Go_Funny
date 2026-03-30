import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { getRandomCover, seedTrips } from '@/lib/seed-data'
import { withSettlement } from '@/lib/settlement'
import {
  CreateContributionInput,
  CreateExpenseInput,
  CreateTripInput,
  Trip,
  TripWithSettlement,
  UpdateTripInput,
} from '@/types'

const storageKey = 'trip-account-data'
const memberColors = ['bg-[#D5E9EF]', 'bg-[#DCEAD9]', 'bg-[#EFE2D4]', 'bg-[#E2E1F5]', 'bg-[#F2DFC8]']

interface AppDataContextValue {
  trips: TripWithSettlement[]
  createTrip: (input: CreateTripInput) => TripWithSettlement
  updateTrip: (tripId: string, input: UpdateTripInput) => void
  deleteTrip: (tripId: string) => void
  addMember: (tripId: string, name: string) => void
  deleteMember: (tripId: string, memberId: string) => void
  addExpense: (tripId: string, input: CreateExpenseInput) => void
  deleteExpense: (tripId: string, expenseId: string) => void
  addContribution: (tripId: string, input: CreateContributionInput) => void
  deleteContribution: (tripId: string, contributionId: string) => void
  getTripById: (tripId?: string) => TripWithSettlement | undefined
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

function toAvatar(name: string) {
  return name.trim().charAt(0).toUpperCase() || '旅'
}

function hydrateTrips(rawTrips: Trip[]) {
  return rawTrips.map((trip) => withSettlement(trip))
}

export function AppDataProvider({ children }: PropsWithChildren) {
  const [trips, setTrips] = useState<Trip[]>(() => {
    if (typeof window === 'undefined') {
      return seedTrips
    }

    try {
      const stored = window.localStorage.getItem(storageKey)
      return stored ? (JSON.parse(stored) as Trip[]) : seedTrips
    } catch {
      return seedTrips
    }
  })

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(trips))
  }, [trips])

  const settledTrips = useMemo(() => hydrateTrips(trips), [trips])

  const value = useMemo<AppDataContextValue>(() => ({
    trips: settledTrips,
    createTrip: (input) => {
      const nextTrip: Trip = {
        id: createId('trip'),
        title: input.title,
        location: input.location,
        startDate: input.startDate,
        endDate: input.endDate,
        mode: input.mode,
        cover: getRandomCover(trips.length),
        members: [],
        expenses: [],
        contributions: [],
      }

      setTrips((current) => [nextTrip, ...current])
      return withSettlement(nextTrip)
    },
    updateTrip: (tripId, input) => {
      setTrips((current) =>
        current.map((trip) =>
          trip.id === tripId
            ? (() => {
                const modeChanged = trip.mode !== input.mode

                return {
                  ...trip,
                  ...input,
                  cover: input.cover ?? trip.cover,
                  // Switching accounting mode invalidates existing detail/settlement basis.
                  expenses: modeChanged ? [] : trip.expenses,
                  contributions: modeChanged ? [] : trip.contributions,
                }
              })()
            : trip,
        ),
      )
    },
    deleteTrip: (tripId) => {
      setTrips((current) => current.filter((trip) => trip.id !== tripId))
    },
    addMember: (tripId, name) => {
      const cleanName = name.trim()
      if (!cleanName) {
        return
      }

      setTrips((current) =>
        current.map((trip) =>
          trip.id === tripId
            ? trip.members.some((member) => member.name === cleanName)
              ? trip
              : {
                  ...trip,
                  members: [
                    ...trip.members,
                    {
                      id: createId('member'),
                      name: cleanName,
                      avatar: toAvatar(cleanName),
                      color: memberColors[trip.members.length % memberColors.length],
                    },
                  ],
                }
            : trip,
        ),
      )
    },
    deleteMember: (tripId, memberId) => {
      setTrips((current) =>
        current.map((trip) => {
          if (trip.id !== tripId) {
            return trip
          }

          return {
            ...trip,
            members: trip.members.filter((member) => member.id !== memberId),
            expenses: trip.expenses
              .filter((expense) => expense.payerId !== memberId)
              .map((expense) => ({
                ...expense,
                participants: expense.participants.filter((participant) => participant !== memberId),
                splits: expense.splits?.filter((split) => split.memberId !== memberId),
              })),
            contributions: trip.contributions.filter((contribution) => contribution.memberId !== memberId),
          }
        }),
      )
    },
    addExpense: (tripId, input) => {
      setTrips((current) =>
        current.map((trip) =>
          trip.id === tripId
            ? {
                ...trip,
                expenses: [
                  {
                    id: createId('expense'),
                    title: input.title,
                    amount: input.amount,
                    date: input.date,
                    splitType: input.splitType,
                    participants: input.participants,
                    payerId: input.payerId,
                    note: input.note,
                    splits: input.splits,
                  },
                  ...trip.expenses,
                ],
              }
            : trip,
        ),
      )
    },
    deleteExpense: (tripId, expenseId) => {
      setTrips((current) =>
        current.map((trip) =>
          trip.id === tripId
            ? {
                ...trip,
                expenses: trip.expenses.filter((expense) => expense.id !== expenseId),
              }
            : trip,
        ),
      )
    },
    addContribution: (tripId, input) => {
      setTrips((current) =>
        current.map((trip) =>
          trip.id === tripId
            ? {
                ...trip,
                contributions: [
                  {
                    id: createId('contribution'),
                    memberId: input.memberId,
                    amount: input.amount,
                    date: input.date,
                  },
                  ...trip.contributions,
                ],
              }
            : trip,
        ),
      )
    },
    deleteContribution: (tripId, contributionId) => {
      setTrips((current) =>
        current.map((trip) =>
          trip.id === tripId
            ? {
                ...trip,
                contributions: trip.contributions.filter((contribution) => contribution.id !== contributionId),
              }
            : trip,
        ),
      )
    },
    getTripById: (tripId) => (tripId ? settledTrips.find((trip) => trip.id === tripId) : undefined),
  }), [settledTrips, trips.length])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)

  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider')
  }

  return context
}
