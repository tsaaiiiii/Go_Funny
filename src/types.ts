export type TripMode = 'expense' | 'pool'

export type SplitType = 'equal_all' | 'equal_selected' | 'custom'

export interface Member {
  id: string
  name: string
  avatar: string
  color: string
}

export interface Expense {
  id: string
  title: string
  amount: number
  date: string
  splitType: SplitType
  participants: string[]
  payerId?: string
  splits?: ExpenseSplit[]
  note?: string
}

export interface ExpenseSplit {
  memberId: string
  amount: number
}

export interface Contribution {
  id: string
  memberId: string
  amount: number
  date: string
}

export interface SettlementRow {
  memberId: string
  paid: number
  share: number
  net: number
}

export interface Transfer {
  fromMemberId: string
  toMemberId: string
  amount: number
}

export interface Trip {
  id: string
  title: string
  location: string
  startDate: string
  endDate: string
  mode: TripMode
  cover: string
  members: Member[]
  expenses: Expense[]
  contributions: Contribution[]
}

export interface TripWithSettlement extends Trip {
  settlement: {
    rows: SettlementRow[]
    transfers: Transfer[]
  }
}

export interface CreateTripInput {
  title: string
  location: string
  startDate: string
  endDate: string
  mode: TripMode
}

export interface UpdateTripInput extends CreateTripInput {
  cover?: string
}

export interface CreateExpenseInput {
  title: string
  amount: number
  date: string
  splitType: SplitType
  participants: string[]
  payerId?: string
  note?: string
  splits?: ExpenseSplit[]
}

export interface CreateContributionInput {
  memberId: string
  amount: number
  date: string
}
