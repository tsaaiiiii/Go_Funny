import { useEffect, useMemo, useState } from 'react'
import { ChevronUp, Plus, Trash2, Users, Wallet2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeading } from '@/components/ui/section-heading'
import { useGetTripById } from '@/api/generated/trips/trips'
import { useDeleteTripExpense } from '@/api/generated/expenses/expenses'
import { formatCurrency } from '@/lib/currency'
import type { Expense, Member } from '@/api/generated/model'

function buildDateRange(startDate: string, endDate: string) {
  const dates: string[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

function formatDayLabel(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`)
  return new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
  }).format(date)
}

function isToday(dateString: string) {
  return dateString === new Date().toISOString().slice(0, 10)
}

const allDateKey = 'all'

function findDefaultSelectedDate(expenseDates: string[], tripStartDate: string) {
  const today = new Date().toISOString().slice(0, 10)

  if (expenseDates.includes(today)) {
    return today
  }

  if (expenseDates.length > 0) {
    const latestExpenseDate = [...expenseDates].sort()[expenseDates.length - 1]
    return latestExpenseDate ?? tripStartDate
  }

  return allDateKey
}

function buildExpenseSplitDetails(expense: Expense, members: Member[]) {
  if (!expense.splits || expense.splits.length === 0) return []

  return expense.splits
    .map((split) => ({
      member: members.find((member) => member.id === split.membershipId),
      amount: split.amount,
    }))
    .filter((item): item is { member: Member; amount: number } => Boolean(item.member))
}

export function TripDetailPage() {
  const { tripId } = useParams()
  const queryClient = useQueryClient()
  const { data: tripResponse } = useGetTripById(tripId!)
  const trip = tripResponse?.data
  const deleteExpenseMutation = useDeleteTripExpense()

  if (!trip) {
    return null
  }

  const startDateStr = new Date(trip.startDate).toISOString().slice(0, 10)
  const endDateStr = new Date(trip.endDate).toISOString().slice(0, 10)
  const totalExpense = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalContribution = trip.contributions.reduce((sum, contribution) => sum + contribution.amount, 0)
  const tripDates = useMemo(() => buildDateRange(startDateStr, endDateStr), [startDateStr, endDateStr])
  const expenseDates = useMemo(() => trip.expenses.map((expense) => new Date(expense.date).toISOString().slice(0, 10)), [trip.expenses])
  const [selectedDate, setSelectedDate] = useState<string>(findDefaultSelectedDate(expenseDates, startDateStr))

  useEffect(() => {
    const nextDate = findDefaultSelectedDate(expenseDates, startDateStr)
    setSelectedDate((current: string) =>
      current === allDateKey || tripDates.includes(current) ? current : nextDate,
    )
  }, [startDateStr, expenseDates, tripDates])

  const selectedDateExpenses =
      selectedDate === allDateKey
      ? trip.expenses
      : trip.expenses.filter((expense) => new Date(expense.date).toISOString().slice(0, 10) === selectedDate)
  const selectedDateTotal = selectedDateExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  async function handleDeleteExpense(expenseId: string) {
    await deleteExpenseMutation.mutateAsync({ tripId: tripId!, expenseId })
    await queryClient.invalidateQueries({ queryKey: [`/go-funny-api/trips/${tripId}`] })
  }

  return (
    <div className="space-y-5 pb-4">
      <MobileHeader title={trip.title} backTo="/" />

      <Card className="border-none shadow-float">
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <Badge tone={trip.mode === 'expense' ? 'blue' : 'green'}>
              {trip.mode === 'expense' ? '一般記帳' : '公積金'}
            </Badge>
            <p className="text-sm text-muted-foreground">{startDateStr} — {endDateStr}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-[#F4FAFB] p-4">
              <p className="text-xs text-muted-foreground">目前總支出</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalExpense)}</p>
            </div>
            <div className="rounded-3xl bg-[#F5FAF6] p-4">
              <p className="text-xs text-muted-foreground">共同資金</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalContribution)}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/trip/${trip.id}/new-expense`}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground shadow-soft transition-all hover:bg-[#4E99A9]"
            >
              <Plus className="h-4 w-4" />
              新增支出
            </Link>
            <Link
              to={`/trip/${trip.id}/settlement`}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-card px-4 py-2 font-medium text-foreground transition-all hover:bg-white"
            >
              查看結算
            </Link>
          </div>

        </CardContent>
      </Card>

      <SectionHeading title="每日明細" />

      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSelectedDate(allDateKey)}
            className={`min-w-fit rounded-2xl border px-3 py-2 text-center transition-colors ${
              selectedDate === allDateKey ? 'border-primary bg-[#EEF7F8]' : 'border-border bg-white'
            }`}
          >
            <p className={`text-sm font-medium ${selectedDate === allDateKey ? 'text-primary' : 'text-foreground'}`}>全部</p>
          </button>
          {tripDates.map((date) => {
            const active = selectedDate === date
            const today = isToday(date)

            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`min-w-fit rounded-2xl border px-3 py-2 text-center transition-colors ${
                  active
                    ? 'border-primary bg-[#EEF7F8]'
                    : today
                      ? 'border-[#CFE5EA] bg-[#F7FBFC]'
                      : 'border-border bg-white'
                }`}
              >
                <p className={`text-sm font-medium ${active ? 'text-primary' : today ? 'text-[#4F7E8A]' : 'text-foreground'}`}>{formatDayLabel(date)}</p>
              </button>
            )
          })}
        </div>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div>
            <p className="text-sm text-muted-foreground">
              {selectedDate === allDateKey ? '全部支出' : formatDayLabel(selectedDate)}
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{formatCurrency(selectedDateTotal)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {trip.expenses.length === 0 ? (
          <EmptyState
            title="還沒有支出紀錄"
            description="先新增第一筆支出，之後結算結果才會出現。"
            action={
              <Link to={`/trip/${trip.id}/new-expense`} className="inline-flex">
                <Badge tone="blue">新增第一筆支出</Badge>
              </Link>
            }
          />
        ) : selectedDateExpenses.length === 0 ? (
          <EmptyState title="這一天還沒有支出" description="可以切換其他日期，或直接新增一筆支出。" />
        ) : selectedDateExpenses.map((expense) => {
          const payer = trip.memberships.find((member) => member.id === expense.payerMembershipId)
          const splitDetails = buildExpenseSplitDetails(expense, trip.memberships)
          const participantNames = splitDetails.map((detail) => detail.member.user.name)

          return (
            <Card key={expense.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge tone="blue">
                        {expense.splitType === 'equal_all'
                          ? '全部平分'
                          : expense.splitType === 'equal_selected'
                            ? '部分平分'
                            : '自訂金額'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{new Date(expense.date).toISOString().slice(0, 10)}</span>
                    </div>
                    <h3 className="text-base font-semibold">{expense.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {splitDetails.length} 位參與
                      </span>
                      {payer ? (
                        <span className="inline-flex items-center gap-1">
                          <Wallet2 className="h-4 w-4" />
                          {payer.user.name} 付款
                        </span>
                        ) : null}
                    </div>
                    {expense.note ? <p className="text-sm text-muted-foreground">{expense.note}</p> : null}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-foreground">{formatCurrency(expense.amount)}</p>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="mt-2 inline-flex h-7 items-center gap-1 rounded-full border border-[#F1C7C7] bg-[#FFF5F5] px-2.5 text-[11px] font-medium text-danger transition-colors hover:bg-[#FEEBEB]"
                    >
                      <Trash2 className="h-3 w-3" />
                      刪除
                    </button>
                  </div>
                </div>
                <details className="mt-3 w-full rounded-2xl bg-[#F8FBFC] p-3">
                  <summary className="cursor-pointer text-xs font-medium text-primary">查看細節</summary>
                  <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                    <p>
                      {payer
                        ? `${payer.user.name} 付款 ${formatCurrency(expense.amount)}`
                        : `共同錢池支付 ${formatCurrency(expense.amount)}`}
                    </p>
                    <p>參與成員：{participantNames.length > 0 ? participantNames.join('、') : '全部成員'}</p>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">分攤明細</p>
                      {splitDetails.map((detail) => (
                        <div key={detail.member.id} className="flex items-center justify-between rounded-xl bg-white px-2.5 py-1.5">
                          <span>{detail.member.user.name}</span>
                          <span className="font-medium text-foreground">{formatCurrency(detail.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {trip.mode === 'pool' ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <SectionHeading title="公積金存入" />
            <Link
              to={`/trip/${trip.id}/new-contribution`}
              className="inline-flex h-8 items-center justify-center rounded-full border border-[#CFE4D4] bg-[#F3FAF5] px-3 text-xs font-medium text-secondary transition-colors hover:bg-[#EAF6EE]"
            >
              新增公積金
            </Link>
          </div>
          <Card>
            <CardContent className="space-y-3 pt-5">
              {trip.contributions.length === 0 ? (
                <EmptyState
                  title="還沒有公積金存入"
                  description="先新增一筆共同資金，讓公積金模式的旅程有初始池金。"
                />
              ) : trip.contributions.map((contribution) => {
                const member = trip.memberships.find((item) => item.id === contribution.membershipId)
                return (
                  <div key={contribution.id} className="flex items-center justify-between rounded-2xl bg-[#F8FBF8] px-4 py-3">
                    <div>
                      <p className="font-medium">{member?.user.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(contribution.date).toISOString().slice(0, 10)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-secondary">{formatCurrency(contribution.amount)}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </>
      ) : null}

      <button
        type="button"
        aria-label="回到頁面頂端"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#CFE2E7] bg-white/95 text-primary shadow-soft backdrop-blur transition-colors hover:bg-[#F3FAFB] sm:right-6"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </div>
  )
}
