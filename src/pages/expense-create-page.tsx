import { ChevronDown, CircleDollarSign, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeading } from '@/components/ui/section-heading'
import { useGetTrips, useGetTripById } from '@/api/generated/trips/trips'
import { useCreateTripExpense } from '@/api/generated/expenses/expenses'
import { formatCurrency } from '@/lib/currency'

function getTodayInputValue() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function ExpenseCreatePage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: tripsResponse } = useGetTrips()
  const trips = tripsResponse?.data ?? []
  const [selectedTripId, setSelectedTripId] = useState(tripId ?? '')
  const { data: tripResponse } = useGetTripById(selectedTripId, { query: { enabled: !!selectedTripId } })
  const trip = tripResponse?.data
  const createExpenseMutation = useCreateTripExpense()

  const [title, setTitle] = useState('河原町晚餐')
  const [amount, setAmount] = useState('2400')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(getTodayInputValue)
  const [payerMembershipId, setPayerMembershipId] = useState(trip?.memberships[0]?.id ?? '')
  const [splitMode, setSplitMode] = useState<'equal' | 'custom' | null>('equal')
  const [selectedMembers, setSelectedMembers] = useState<string[]>(trip?.memberships.map((m) => m.id) ?? [])
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({})

  if (!trip) {
    return null
  }

  useEffect(() => {
    if (tripId) setSelectedTripId(tripId)
  }, [tripId])

  useEffect(() => {
    setPayerMembershipId(trip.memberships[0]?.id ?? '')
    setSelectedMembers(trip.memberships.map((m) => m.id))
    setCustomAmounts({})
    setSplitMode('equal')
  }, [trip.id, trip.memberships])

  const allMemberIds = useMemo(() => trip.memberships.map((m) => m.id), [trip.memberships])
  const parsedAmount = Number(amount) || 0
  const averageAmount = useMemo(() => Math.round(parsedAmount / Math.max(selectedMembers.length, 1)), [parsedAmount, selectedMembers.length])
  const splitType =
    splitMode === 'custom'
      ? 'custom'
      : selectedMembers.length === trip.memberships.length
        ? 'equal_all'
        : 'equal_selected'
  const customTotal = selectedMembers.reduce((sum, id) => sum + (Number(customAmounts[id]) || 0), 0)
  const customSplitValid = splitMode !== 'custom' || (selectedMembers.length > 0 && customTotal === parsedAmount)

  async function handleSubmit() {
    if (!trip) return
    if (!title.trim() || parsedAmount <= 0 || selectedMembers.length === 0 || !customSplitValid) return

    await createExpenseMutation.mutateAsync({
      tripId: trip.id,
      data: {
        title: title.trim(),
        amount: parsedAmount,
        date,
        splitType: splitType as 'equal_all' | 'equal_selected' | 'custom',
        payerMembershipId: trip.mode === 'expense' ? payerMembershipId : undefined,
        note: note.trim() || undefined,
      },
    })

    await queryClient.invalidateQueries({ queryKey: [`/go-funny-api/trips/${trip.id}`] })
    navigate(`/trip/${trip.id}`)
  }

  return (
    <div className="space-y-5 pb-4">
      <MobileHeader title="新增支出" subtitle={trip.title} backTo={`/trip/${trip.id}`} />

      <Card>
        <CardContent className="space-y-2 pt-5">
          <label className="text-sm font-medium text-foreground">旅程</label>
          <div className="relative">
            <select
              className="h-12 w-full appearance-none rounded-2xl border border-border bg-white pl-4 pr-11 text-[15px] font-medium text-foreground outline-none transition-colors focus:border-primary"
              value={trip.id}
              onChange={(event) => {
                const nextTripId = event.target.value
                setSelectedTripId(nextTripId)
                navigate(`/trip/${nextTripId}/new-expense`)
              }}
            >
              {trips.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.96),rgba(242,248,248,0.92))] shadow-float">
        <CardContent className="space-y-5 pt-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">項目名稱</label>
            <input className="h-12 w-full rounded-2xl border border-border bg-white px-4 outline-none ring-0 placeholder:text-muted-foreground focus:border-primary" placeholder="例如：河原町晚餐" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">金額</label>
            <div className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-white px-4 focus-within:border-primary">
              <CircleDollarSign className="h-5 w-5 text-primary" />
              <input className="w-full bg-transparent outline-none placeholder:text-muted-foreground" value={amount} onChange={(event) => setAmount(event.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">日期</label>
            <input type="date" className="h-12 w-full rounded-2xl border border-border bg-white px-4 outline-none focus:border-primary" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>

          {trip.mode === 'expense' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">付款人</label>
              <div className="grid grid-cols-3 gap-2">
                {trip.memberships.map((member) => (
                  <button
                    key={member.id}
                    className={`rounded-2xl border px-3 py-3 text-sm font-medium ${payerMembershipId === member.id ? 'border-primary bg-[#EDF7F9] text-primary' : 'border-border bg-white text-foreground'}`}
                    type="button"
                    onClick={() => setPayerMembershipId(member.id)}
                  >
                    {member.user.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#F5FAF6] p-4 text-sm text-muted-foreground">
              公積金模式下，支出直接從共同錢池扣除，不會記錄由誰支付
            </div>
          )}
        </CardContent>
      </Card>

      <SectionHeading title="分攤方式" />

      {trip.memberships.length === 0 ? (
        <EmptyState
          title="還沒有成員"
          description="請先回到旅程詳情邀請成員加入，才能建立支出紀錄。"
          action={
            <Link to={`/trip/${tripId}/members`} className="inline-flex">
              <Button>前往成員管理</Button>
            </Link>
          }
        />
      ) : (
        <>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSplitMode('equal')
              setSelectedMembers(allMemberIds)
            }}
            className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
              splitMode === 'equal' ? 'border-primary bg-[#EEF7F8] text-primary' : 'border-border bg-card text-foreground'
            }`}
          >
            全部人平分
          </button>
          <button
            type="button"
            onClick={() => setSplitMode('custom')}
            className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
              splitMode === 'custom' ? 'border-primary bg-[#EEF7F8] text-primary' : 'border-border bg-card text-foreground'
            }`}
          >
            自訂金額
          </button>
        </div>

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">參與成員</h2>
              <p className="text-sm text-muted-foreground">依照分攤方式決定誰需要負擔這筆花費。</p>
            </div>
            <Badge tone="green">{selectedMembers.length} 人</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {trip.memberships.map((member) => {
              const active = selectedMembers.includes(member.id)

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() =>
                    setSelectedMembers((current) => {
                      if (current.includes(member.id)) {
                        setCustomAmounts((draft) => {
                          const nextDraft = { ...draft }
                          delete nextDraft[member.id]
                          return nextDraft
                        })
                        const next = current.filter((item) => item !== member.id)
                        if (splitMode !== 'custom') setSplitMode(next.length === trip.memberships.length ? 'equal' : null)
                        return next
                      }

                      setCustomAmounts((draft) => ({
                        ...draft,
                        [member.id]: draft[member.id] ?? `${averageAmount}`,
                      }))
                      const next = [...current, member.id]
                      if (splitMode !== 'custom') setSplitMode(next.length === trip.memberships.length ? 'equal' : null)
                      return next
                    })
                  }
                  className={`rounded-2xl border px-4 py-4 text-left ${active ? 'border-secondary bg-[#F3F8F4]' : 'border-border bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D5E9EF] text-sm font-semibold">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground">{active ? '已加入分攤' : '未加入'}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="rounded-3xl bg-[#F8FBF8] p-4">
            {splitMode === 'custom' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">自訂分攤總額</span>
                  <span className={`font-semibold ${customSplitValid ? 'text-secondary' : 'text-danger'}`}>
                    {formatCurrency(customTotal)} / {formatCurrency(parsedAmount)}
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedMembers.map((membershipId) => {
                    const member = trip.memberships.find((item) => item.id === membershipId)
                    return (
                      <div key={membershipId} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D5E9EF] text-sm font-semibold">
                          {member?.user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{member?.user.name}</span>
                        <input
                          className="w-24 rounded-xl border border-border bg-[#FAFCFC] px-3 py-2 text-right text-sm outline-none focus:border-primary"
                          inputMode="numeric"
                          value={customAmounts[membershipId] ?? ''}
                          onChange={(event) => {
                            const nextValue = event.target.value
                            if (!/^\d*$/.test(nextValue)) return
                            setCustomAmounts((current) => ({
                              ...current,
                              [membershipId]: nextValue,
                            }))
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs leading-5 text-muted-foreground">自訂模式下，所有人的負擔總額必須等於支出金額。</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">每人預估負擔</span>
                  <span className="font-semibold text-foreground">{formatCurrency(averageAmount)}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  先用「全部人平分」快速全選，再從下方成員調整參與名單。
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">備註</label>
            <textarea className="min-h-24 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none placeholder:text-muted-foreground focus:border-primary" placeholder="例如：這餐只有部分人參加" value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
        </CardContent>
      </Card>
      </div>

        </>
      )}

      <Button size="lg" className="w-full gap-2" onClick={handleSubmit} disabled={!title.trim() || parsedAmount <= 0 || selectedMembers.length === 0 || !customSplitValid}>
        <Plus className="h-4 w-4" />
        儲存這筆支出
      </Button>
    </div>
  )
}
