import { Expense, Member, Trip, TripWithSettlement } from '@/types'

function roundCurrency(value: number) {
  return Math.round(value)
}

function distributeExpenseShare(expense: Expense, members: Member[]) {
  const shares = new Map<string, number>()
  const participants = expense.participants.length > 0 ? expense.participants : members.map((member) => member.id)

  if (expense.splitType === 'custom' && expense.splits && expense.splits.length > 0) {
    expense.splits.forEach((split) => {
      shares.set(split.memberId, roundCurrency(split.amount))
    })
    return shares
  }

  const splitTargets =
    expense.splitType === 'equal_all' ? members.map((member) => member.id) : participants

  if (splitTargets.length === 0) {
    return shares
  }

  const base = Math.floor(expense.amount / splitTargets.length)
  let remainder = roundCurrency(expense.amount - base * splitTargets.length)

  splitTargets.forEach((memberId, index) => {
    const extra = index < remainder ? 1 : 0
    shares.set(memberId, base + extra)
  })

  return shares
}

function buildTransfers(balanceMap: Map<string, number>) {
  const creditors = Array.from(balanceMap.entries())
    .filter(([, value]) => value > 0)
    .map(([memberId, value]) => ({ memberId, value }))
    .sort((left, right) => right.value - left.value)

  const debtors = Array.from(balanceMap.entries())
    .filter(([, value]) => value < 0)
    .map(([memberId, value]) => ({ memberId, value: Math.abs(value) }))
    .sort((left, right) => right.value - left.value)

  const transfers: TripWithSettlement['settlement']['transfers'] = []
  let creditorIndex = 0
  let debtorIndex = 0

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex]
    const debtor = debtors[debtorIndex]
    const amount = Math.min(creditor.value, debtor.value)

    if (amount > 0) {
      transfers.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amount: roundCurrency(amount),
      })
    }

    creditor.value = roundCurrency(creditor.value - amount)
    debtor.value = roundCurrency(debtor.value - amount)

    if (creditor.value === 0) {
      creditorIndex += 1
    }

    if (debtor.value === 0) {
      debtorIndex += 1
    }
  }

  return transfers
}

export function calculateSettlement(trip: Trip): TripWithSettlement['settlement'] {
  const paidMap = new Map<string, number>()
  const shareMap = new Map<string, number>()

  trip.members.forEach((member) => {
    paidMap.set(member.id, 0)
    shareMap.set(member.id, 0)
  })

  if (trip.mode === 'expense') {
    trip.expenses.forEach((expense) => {
      if (expense.payerId) {
        paidMap.set(expense.payerId, roundCurrency((paidMap.get(expense.payerId) ?? 0) + expense.amount))
      }

      distributeExpenseShare(expense, trip.members).forEach((amount, memberId) => {
        shareMap.set(memberId, roundCurrency((shareMap.get(memberId) ?? 0) + amount))
      })
    })
  } else {
    trip.contributions.forEach((contribution) => {
      paidMap.set(contribution.memberId, roundCurrency((paidMap.get(contribution.memberId) ?? 0) + contribution.amount))
    })

    trip.expenses.forEach((expense) => {
      distributeExpenseShare(expense, trip.members).forEach((amount, memberId) => {
        shareMap.set(memberId, roundCurrency((shareMap.get(memberId) ?? 0) + amount))
      })
    })
  }

  const rows = trip.members.map((member) => {
    const paid = paidMap.get(member.id) ?? 0
    const share = shareMap.get(member.id) ?? 0
    return {
      memberId: member.id,
      paid,
      share,
      net: roundCurrency(paid - share),
    }
  })

  const balanceMap = new Map(rows.map((row) => [row.memberId, row.net]))
  const transfers = trip.mode === 'pool' ? [] : buildTransfers(balanceMap)

  return {
    rows,
    transfers,
  }
}

export function withSettlement(trip: Trip): TripWithSettlement {
  return {
    ...trip,
    settlement: calculateSettlement(trip),
  }
}
