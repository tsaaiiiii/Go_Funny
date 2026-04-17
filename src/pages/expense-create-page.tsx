import { ChevronDown, CircleDollarSign, PiggyBank, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DatePickerField } from '@/components/ui/date-picker-field'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
import { PageBlockingLoading } from '@/components/ui/page-blocking-loading'
import { SectionHeading } from '@/components/ui/section-heading'
import { queueFlashToast, useToast } from '@/components/ui/toast'
import { useGetTrips, useGetTripById } from '@/api/generated/trips/trips'
import { useCreateTripExpense, useUpdateTripExpense } from '@/api/generated/expenses/expenses'
import { useCreateTripContribution } from '@/api/generated/contributions/contributions'
import { hasStatus } from '@/lib/api-response'
import { formatCurrency } from '@/lib/currency'
import { getTodayInputValue, toDateInputValue } from '@/lib/date'

export function ExpenseCreatePage() {
  const { tripId, expenseId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showError } = useToast()
  const { data: tripsResponse, isPending: tripsPending } = useGetTrips()
  const trips = hasStatus(tripsResponse, 200) ? tripsResponse.data : []
  const [selectedTripId, setSelectedTripId] = useState(tripId ?? '')
  const { data: tripResponse, isPending: tripPending } = useGetTripById(selectedTripId, { query: { enabled: !!selectedTripId } })
  const trip = hasStatus(tripResponse, 200) ? tripResponse.data : null
  const createExpenseMutation = useCreateTripExpense()
  const updateExpenseMutation = useUpdateTripExpense()
  const createContributionMutation = useCreateTripContribution()
  const isEditingExpense = Boolean(expenseId)
  const editingExpense = trip?.expenses.find((expense) => expense.id === expenseId) ?? null
  const [submitFlowPending, setSubmitFlowPending] = useState(false)
  const expenseMutationPending =
    submitFlowPending ||
    createExpenseMutation.isPending ||
    updateExpenseMutation.isPending ||
    createContributionMutation.isPending
  const initialRecordTab = searchParams.get('tab') === 'contribution' ? 'contribution' : 'expense'

  const [title, setTitle] = useState('')
  const [titleError, setTitleError] = useState<string | null>(null)
  const [amount, setAmount] = useState('2400')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(getTodayInputValue)
  const [payerMembershipId, setPayerMembershipId] = useState(trip?.memberships[0]?.id ?? '')
  const [splitMode, setSplitMode] = useState<'equal' | 'custom' | null>('equal')
  const [selectedMembers, setSelectedMembers] = useState<string[]>(trip?.memberships.map((m) => m.id) ?? [])
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({})
  const [recordTab, setRecordTab] = useState<'expense' | 'contribution'>(initialRecordTab)
  const [contributionMembershipId, setContributionMembershipId] = useState(trip?.memberships[0]?.id ?? '')
  const [contributionAmount, setContributionAmount] = useState('3000')
  const [contributionDate, setContributionDate] = useState(getTodayInputValue)
  const memberships = trip?.memberships ?? []

  useEffect(() => {
    if (tripId) setSelectedTripId(tripId)
  }, [tripId])

  useEffect(() => {
    if (!trip) {
      return
    }

    if (isEditingExpense) {
      if (!editingExpense) {
        return
      }

      const splitMembershipIds = editingExpense.splits.map((split) => split.membershipId)
      const nextSelectedMembers =
        splitMembershipIds.length > 0
          ? splitMembershipIds
          : editingExpense.splitType === 'equal_all'
            ? trip.memberships.map((member) => member.id)
            : []

      setTitle(editingExpense.title)
      setAmount(String(editingExpense.amount))
      setNote(editingExpense.note ?? '')
      setDate(toDateInputValue(editingExpense.date))
      setPayerMembershipId(editingExpense.payerMembershipId ?? trip.memberships[0]?.id ?? '')
      setSelectedMembers(nextSelectedMembers)
      setCustomAmounts(
        editingExpense.splits.reduce<Record<string, string>>((draft, split) => {
          draft[split.membershipId] = String(split.amount)
          return draft
        }, {}),
      )
      setSplitMode(editingExpense.splitType === 'custom' ? 'custom' : editingExpense.splitType === 'equal_all' ? 'equal' : null)
      return
    }

    setPayerMembershipId(trip.memberships[0]?.id ?? '')
    setSelectedMembers(trip.memberships.map((m) => m.id))
    setCustomAmounts({})
    setSplitMode('equal')
    setContributionMembershipId((current) =>
      current && trip.memberships.some((member) => member.id === current)
        ? current
        : trip.memberships[0]?.id ?? '',
    )
    if (trip.mode !== 'pool') {
      setRecordTab('expense')
    }
  }, [editingExpense, isEditingExpense, trip])

  const allMemberIds = useMemo(() => memberships.map((m) => m.id), [memberships])
  const parsedAmount = Number(amount) || 0
  const averageAmount = useMemo(() => Math.round(parsedAmount / Math.max(selectedMembers.length, 1)), [parsedAmount, selectedMembers.length])
  const splitType =
    splitMode === 'custom'
      ? 'custom'
      : selectedMembers.length === memberships.length
        ? 'equal_all'
        : 'equal_selected'
  const customTotal = selectedMembers.reduce((sum, id) => sum + (Number(customAmounts[id]) || 0), 0)
  const customSplitValid = splitMode !== 'custom' || (selectedMembers.length > 0 && customTotal === parsedAmount)
  const parsedContributionAmount = Number(contributionAmount)
  const isContributionTab = !isEditingExpense && trip?.mode === 'pool' && recordTab === 'contribution'
  const currentTotalContribution = trip?.contributions.reduce((sum, item) => sum + item.amount, 0) ?? 0

  if (tripsPending || (selectedTripId && tripPending)) {
    return <LoadingState title="支出表單載入中" description="正在準備旅程與成員資料。" />
  }

  if (!trip) {
    return <LoadingState title="找不到旅程資料" description="請稍後重試，或回首頁重新選擇旅程。" compact />
  }

  if (isEditingExpense && !editingExpense) {
    return <LoadingState title="找不到支出明細" description="這筆明細可能已被刪除，請回旅程明細重新確認。" compact />
  }

  async function handleSubmit() {
    if (!trip) return
    if (!title.trim()) {
      setTitleError('請輸入項目名稱')
    }
    if (!title.trim() || parsedAmount <= 0 || selectedMembers.length === 0 || !customSplitValid) {
      showError(isEditingExpense ? '無法儲存明細' : '無法建立支出', '請先確認名稱、金額與分攤設定是否完整。')
      return
    }

    setSubmitFlowPending(true)

    try {
      if (isEditingExpense && editingExpense) {
        const result = await updateExpenseMutation.mutateAsync({
          tripId: trip.id,
          expenseId: editingExpense.id,
          data: {
            title: title.trim(),
            amount: parsedAmount,
            date,
            splitType: splitType as 'equal_all' | 'equal_selected' | 'custom',
            payerMembershipId: trip.mode === 'expense' ? payerMembershipId || null : null,
            note: note.trim() || null,
          },
        })

        if (result.status !== 200) {
          showError('儲存明細失敗', result.data.message || '請稍後再試。')
          setSubmitFlowPending(false)
          return
        }

        await queryClient.invalidateQueries({ queryKey: [`/trips/${trip.id}`] })
        queueFlashToast({ tone: 'success', title: '明細已更新', description: '這筆支出已完成儲存。' })
        navigate(`/trip/${trip.id}`)
        return
      }

      const result = await createExpenseMutation.mutateAsync({
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

      if (result.status !== 201) {
        showError('建立支出失敗', result.data.message || '請稍後再試。')
        setSubmitFlowPending(false)
        return
      }

      await queryClient.invalidateQueries({ queryKey: [`/trips/${trip.id}`] })
      queueFlashToast({ tone: 'success', title: '支出已建立', description: '這筆紀錄已加入旅程明細。' })
      navigate(`/trip/${trip.id}`)
    } catch {
      showError(
        isEditingExpense ? '儲存明細失敗' : '建立支出失敗',
        isEditingExpense ? '目前無法更新這筆支出，請稍後再試。' : '請稍後再試。',
      )
      setSubmitFlowPending(false)
    }
  }

  async function handleSubmitContribution() {
    if (!trip) return
    if (!contributionMembershipId || Number.isNaN(parsedContributionAmount) || parsedContributionAmount <= 0) {
      showError('無法建立公積金紀錄', '請先確認成員與金額是否正確。')
      return
    }

    setSubmitFlowPending(true)

    try {
      const result = await createContributionMutation.mutateAsync({
        tripId: trip.id,
        data: {
          membershipId: contributionMembershipId,
          amount: parsedContributionAmount,
          date: contributionDate,
        },
      })

      if (result.status !== 201) {
        showError('建立公積金失敗', result.data.message || '請稍後再試。')
        setSubmitFlowPending(false)
        return
      }

      await queryClient.invalidateQueries({ queryKey: [`/trips/${trip.id}`] })
      queueFlashToast({ tone: 'success', title: '公積金已記錄', description: '共同池金額已更新。' })
      navigate(`/trip/${trip.id}`)
    } catch {
      showError('建立公積金失敗', '請稍後再試。')
      setSubmitFlowPending(false)
    }
  }

  function handlePrimaryAction() {
    if (isContributionTab) {
      void handleSubmitContribution()
      return
    }

    void handleSubmit()
  }

  const showRecordTabs = !isEditingExpense && trip.mode === 'pool'
  const pageTitle = isEditingExpense ? '編輯支出' : showRecordTabs ? '新增記錄' : '新增支出'
  const primaryActionDisabled = isContributionTab
    ? !contributionMembershipId || Number.isNaN(parsedContributionAmount) || parsedContributionAmount <= 0 || expenseMutationPending
    : parsedAmount <= 0 || selectedMembers.length === 0 || !customSplitValid || expenseMutationPending
  const primaryActionLabel = expenseMutationPending
    ? '儲存中...'
    : isContributionTab
      ? '儲存存入紀錄'
      : isEditingExpense
        ? '儲存明細'
        : '儲存這筆支出'

  return (
    <div className="space-y-5 pb-4">
      {expenseMutationPending ? (
        <PageBlockingLoading
          title={isContributionTab ? '儲存公積金中' : isEditingExpense ? '儲存明細中' : '儲存支出中'}
          description={
            isContributionTab
              ? '正在建立存入紀錄並更新共同池。'
              : isEditingExpense
                ? '正在更新這筆支出與分攤設定。'
                : '正在建立支出並更新旅程明細。'
          }
        />
      ) : null}
      <MobileHeader title={pageTitle} subtitle={trip.title} backTo={isEditingExpense ? `/trip/${trip.id}` : '/'} />

      {!isEditingExpense ? (
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
      ) : null}

      {showRecordTabs ? (
        <div className="grid grid-cols-2 gap-2 rounded-[24px] border border-[#D9E8EB] bg-white/75 p-1.5 shadow-soft">
          <button
            type="button"
            onClick={() => setRecordTab('expense')}
            className={`min-h-11 rounded-[18px] text-sm font-semibold transition-colors ${
              recordTab === 'expense' ? 'bg-[#EAF5F7] text-primary shadow-soft' : 'text-muted-foreground hover:bg-[#F6FBFC]'
            }`}
          >
            新增支出
          </button>
          <button
            type="button"
            onClick={() => setRecordTab('contribution')}
            className={`min-h-11 rounded-[18px] text-sm font-semibold transition-colors ${
              recordTab === 'contribution' ? 'bg-[#EDF7EF] text-secondary shadow-soft' : 'text-muted-foreground hover:bg-[#F7FBF8]'
            }`}
          >
            新增公積金
          </button>
        </div>
      ) : null}

      {!isContributionTab ? (
        <>
      <Card className="border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.96),rgba(242,248,248,0.92))] shadow-float">
        <CardContent className="space-y-5 pt-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">項目名稱</label>
            <input
              className={`h-12 w-full rounded-2xl border bg-white px-4 outline-none ring-0 placeholder:text-muted-foreground focus:border-primary ${titleError ? 'border-danger' : 'border-border'}`}
              placeholder="河原町晚餐"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                if (titleError) setTitleError(null)
              }}
              onBlur={() => {
                if (!title.trim()) setTitleError('請輸入項目名稱')
              }}
            />
            {titleError ? <p className="px-1 text-xs text-danger">{titleError}</p> : null}
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
            <DatePickerField value={date} onChange={setDate} helperText="選擇支出發生的日期" />
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
            <Link to={`/trip/${trip.id}/members`} className="inline-flex">
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
        </>
      ) : (
        <>
          <Card className="border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.96),rgba(243,248,244,0.92))] shadow-float">
            <CardContent className="space-y-4 pt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">目前共同池</p>
                  <h2 className="text-2xl font-semibold">{formatCurrency(currentTotalContribution)}</h2>
                </div>
                <Badge tone="green">公積金模式</Badge>
              </div>
            </CardContent>
          </Card>

          <SectionHeading title="存入資訊" />

          {trip.memberships.length === 0 ? (
            <EmptyState
              title="還沒有成員"
              description="請先回到成員管理頁邀請旅伴加入，才能建立公積金存入紀錄。"
              action={
                <Link to={`/trip/${trip.id}/members`} className="inline-flex">
                  <Button>前往成員管理</Button>
                </Link>
              }
            />
          ) : (
            <Card>
              <CardContent className="space-y-5 pt-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">成員</label>
                  <div className="grid grid-cols-2 gap-3">
                    {trip.memberships.map((member) => {
                      const active = contributionMembershipId === member.id
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => setContributionMembershipId(member.id)}
                          className={`rounded-2xl border px-4 py-4 text-left ${active ? 'border-secondary bg-[#F3F8F4]' : 'border-border bg-white'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D5E9EF] text-sm font-semibold">
                              {member.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{member.user.name}</p>
                              <p className="text-xs text-muted-foreground">{active ? '此次存入者' : '點擊選擇'}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">金額</label>
                  <div className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-white px-4 focus-within:border-secondary">
                    <PiggyBank className="h-5 w-5 text-secondary" />
                    <input className="w-full bg-transparent outline-none placeholder:text-muted-foreground" value={contributionAmount} onChange={(event) => setContributionAmount(event.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">日期</label>
                  <DatePickerField value={contributionDate} onChange={setContributionDate} accent="secondary" helperText="選擇存入共同池的日期" />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Button size="lg" className="w-full gap-2" onClick={handlePrimaryAction} disabled={primaryActionDisabled}>
        <Plus className="h-4 w-4" />
        {primaryActionLabel}
      </Button>
    </div>
  )
}
