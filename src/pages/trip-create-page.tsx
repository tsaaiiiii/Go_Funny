import { ArrowRight, CalendarRange, Compass, LoaderCircle, Sparkles, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { DateRange } from 'react-day-picker'
import { useQueryClient } from '@tanstack/react-query'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { MobileHeader } from '@/components/layout/mobile-header'
import { LoadingState } from '@/components/ui/loading-state'
import { PageBlockingLoading } from '@/components/ui/page-blocking-loading'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SectionHeading } from '@/components/ui/section-heading'
import { queueFlashToast, useToast } from '@/components/ui/toast'
import { useGetTripById, useCreateTrip, useUpdateTrip, useDeleteTrip } from '@/api/generated/trips/trips'
import { hasStatus } from '@/lib/api-response'
import { authClient } from '@/lib/auth-client'
import { getTodayInputValue } from '@/lib/date'
import { readMockSession } from '@/lib/mock-session'
import type { TripMode } from '@/api/generated/model'

const formatDateChip = (value: string) => {
  const date = new Date(`${value}T00:00:00`)

  return new Intl.DateTimeFormat('zh-TW', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}

const formatDateRangeSummary = (startDate: string, endDate: string) => {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  const startLabel = new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
  }).format(start)
  const endLabel = new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
  }).format(end)

  return `${startLabel} - ${endLabel}`
}

const getTripLengthLabel = (startDate: string, endDate: string) => {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  const diffDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1

  return `${Math.max(diffDays, 1)} 天`
}

export function TripCreatePage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showError, showSuccess } = useToast()
  const { data: session } = authClient.useSession()
  const mockSession = readMockSession()
  const currentUser = session?.user ?? mockSession?.user ?? null
  const { data: tripResponse, isPending } = useGetTripById(tripId!, { query: { enabled: !!tripId } })
  const editingTrip = hasStatus(tripResponse, 200) ? tripResponse.data : null
  const isEditingRoute = Boolean(tripId)
  const isEditing = Boolean(tripId && editingTrip)
  const canDeleteTrip = Boolean(editingTrip && currentUser?.id && editingTrip.createdByUserId === currentUser.id)
  const createTripMutation = useCreateTrip()
  const updateTripMutation = useUpdateTrip()
  const deleteTripMutation = useDeleteTrip()
  const submitPending = createTripMutation.isPending || updateTripMutation.isPending
  const mutationPending = submitPending || deleteTripMutation.isPending

  const [title, setTitle] = useState(editingTrip?.title ?? '')
  const [location, setLocation] = useState(editingTrip?.location ?? '')
  const [startDate, setStartDate] = useState(editingTrip?.startDate ? new Date(editingTrip.startDate).toISOString().slice(0, 10) : getTodayInputValue())
  const [endDate, setEndDate] = useState(editingTrip?.endDate ? new Date(editingTrip.endDate).toISOString().slice(0, 10) : getTodayInputValue())
  const [mode, setMode] = useState<TripMode>(editingTrip?.mode ?? 'expense')
  const [dateRangeOpen, setDateRangeOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => parseISO(getTodayInputValue()))
  const [calendarRange, setCalendarRange] = useState<DateRange | undefined>()
  const modeChanged = Boolean(isEditing && editingTrip && mode !== editingTrip.mode)

  useEffect(() => {
    if (!editingTrip) return
    setTitle(editingTrip.title)
    setLocation(editingTrip.location ?? '')
    setStartDate(new Date(editingTrip.startDate).toISOString().slice(0, 10))
    setEndDate(new Date(editingTrip.endDate).toISOString().slice(0, 10))
    setMode(editingTrip.mode)
  }, [editingTrip])

  const submitLabel = isEditing ? '儲存變更' : '建立旅程'
  const tripLengthLabel = getTripLengthLabel(startDate, endDate)
  const dateRangeSummary = formatDateRangeSummary(startDate, endDate)
  const selectedRange = useMemo<DateRange>(
    () => ({
      from: parseISO(startDate),
      to: parseISO(endDate),
    }),
    [startDate, endDate],
  )

  useEffect(() => {
    if (!dateRangeOpen) {
      setCalendarRange(selectedRange)
    }
  }, [dateRangeOpen, selectedRange])

  if (isEditingRoute && isPending) {
    return <LoadingState title="旅程資料載入中" description="正在準備這趟旅程的編輯內容。" />
  }

  function handleDateRangeOpenChange(open: boolean) {
    setDateRangeOpen(open)

    if (open) {
      setCalendarMonth(parseISO(startDate))
      setCalendarRange(undefined)
    }
  }

  function handleDateRangeSelect(range: DateRange | undefined) {
    if (!range?.from) {
      setCalendarRange(undefined)
      return
    }

    const isFirstClickAfterReset =
      !calendarRange?.from &&
      range.to &&
      format(range.from, 'yyyy-MM-dd') === format(range.to, 'yyyy-MM-dd')

    if (!range.to || isFirstClickAfterReset) {
      setCalendarRange({
        from: range.from,
        to: undefined,
      })
      return
    }

    setCalendarRange(range)
    setStartDate(format(range.from, 'yyyy-MM-dd'))
    setEndDate(format(range.to, 'yyyy-MM-dd'))
    setDateRangeOpen(false)
  }

  async function handleSubmit() {
    if (!title.trim()) {
      showError('無法儲存旅程', '請先輸入旅程名稱。')
      return
    }

    if (isEditing && editingTrip) {
      try {
        if (
          modeChanged &&
          !window.confirm('切換模式後，現有明細與結算資料會被重置，確定要儲存嗎？')
        ) {
          return
        }

        await updateTripMutation.mutateAsync({
          tripId: editingTrip.id,
          data: {
            title: title.trim(),
            location: location.trim() || undefined,
            startDate,
            endDate,
            mode,
          },
        })
        await queryClient.invalidateQueries({ queryKey: ['/trips'] })
        showSuccess('旅程已更新')
      } catch {
        showError('儲存失敗', '請稍後再試。')
      }
      return
    }

    try {
      const result = await createTripMutation.mutateAsync({
        data: {
          title: title.trim(),
          location: location.trim() || undefined,
          startDate,
          endDate,
          mode,
        },
      })
      if (result.status !== 201) {
        throw new Error('Create trip failed')
      }
      await queryClient.invalidateQueries({ queryKey: ['/trips'] })
      queueFlashToast({ tone: 'success', title: '旅程已建立', description: '接著就能邀請旅伴加入。' })
      navigate(`/trip/${result.data.id}/members?from=create`)
    } catch {
      showError('建立旅程失敗', '請稍後再試。')
    }
  }

  async function handleDelete() {
    if (!editingTrip) return

    try {
      const result = await deleteTripMutation.mutateAsync({ tripId: editingTrip.id })

      if (result.status !== 204) {
        showError('刪除旅程失敗', result.data.message || '請稍後再試。')
        return
      }

      await queryClient.invalidateQueries({ queryKey: ['/trips'] })
      queueFlashToast({ tone: 'success', title: '旅程已刪除' })
      navigate('/')
    } catch {
      showError('刪除旅程失敗', '請稍後再試。')
    }
  }

  return (
    <div className="space-y-5 pb-4">
      {mutationPending ? (
        <PageBlockingLoading
          title={deleteTripMutation.isPending ? '刪除旅程中' : '儲存旅程中'}
          description={
            deleteTripMutation.isPending
              ? '正在刪除旅程並整理首頁資料。'
              : '正在儲存旅程設定，請稍候。'
          }
        />
      ) : null}
      <MobileHeader title={isEditing ? '編輯旅程' : '建立旅程'} backTo={isEditing && editingTrip ? `/trip/${editingTrip.id}/manage` : '/'} />

      <Card className="border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.96),rgba(240,247,246,0.92))] shadow-float">
        <CardContent className="space-y-5 pt-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">旅程名稱</label>
            <input className="h-12 w-full rounded-2xl border border-border bg-white px-4 outline-none placeholder:text-muted-foreground focus:border-primary" placeholder="例如：京都初春散策" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">地點</label>
            <div className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-white px-4 focus-within:border-primary">
              <Compass className="h-5 w-5 text-primary" />
              <input className="w-full bg-transparent outline-none placeholder:text-muted-foreground" placeholder="例如：京都 · 日本" value={location} onChange={(event) => setLocation(event.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">旅程日期</label>
            <Popover open={dateRangeOpen} onOpenChange={handleDateRangeOpenChange}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full rounded-[28px] border border-[#D6E6E9] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(243,249,249,0.95))] p-2 text-left shadow-[0_12px_32px_rgba(118,157,167,0.08)] transition-colors hover:border-[#BFD8DE]"
                >
                  <div className="rounded-[22px] bg-[#F8FCFC] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#6A919B]">Trip Range</p>
                        <p className="mt-1 truncate text-[17px] font-semibold text-foreground">{dateRangeSummary}</p>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF4F6] text-primary">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between rounded-[20px] bg-white/70 px-4 py-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4 text-primary" />
                      <span>{formatDateChip(startDate)} 到 {formatDateChip(endDate)}</span>
                    </div>
                    <span className="rounded-full bg-[#EEF7F8] px-3 py-1 text-xs font-semibold text-primary">{tripLengthLabel}</span>
                  </div>
                </button>
              </PopoverTrigger>

              <PopoverContent align="start" className="w-[min(100vw-2rem,24rem)] rounded-[28px] border-[#D6E6E9] p-3">
                <div className="mb-3 flex items-center justify-between rounded-[20px] bg-[#F7FBFC] px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#6A919B]">Trip Range</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {calendarRange?.from && !calendarRange.to ? '再選擇回程日' : '先選出發日，再選回程日'}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-soft">{tripLengthLabel}</span>
                </div>

                <Calendar
                  mode="range"
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  selected={dateRangeOpen ? calendarRange : selectedRange}
                  onSelect={handleDateRangeSelect}
                  defaultMonth={parseISO(startDate)}
                  numberOfMonths={1}
                  className="rounded-[24px] bg-white"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <SectionHeading title="記帳模式" />

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setMode('expense')}
          className={`w-full rounded-3xl border px-4 py-4 text-left ${mode === 'expense' ? 'border-primary bg-[#EEF7F8]' : 'border-border bg-card'}`}
        >
          <div className="mb-2 flex items-center gap-2">
            <Badge tone="blue">一般記帳</Badge>
          </div>
          <p className="font-medium text-foreground">每筆支出都記錄付款人</p>
          <p className="mt-1 text-sm text-muted-foreground">適合由不同旅伴輪流先付款，再一起結算的旅行方式。</p>
        </button>

        <button
          type="button"
          onClick={() => setMode('pool')}
          className={`w-full rounded-3xl border px-4 py-4 text-left ${mode === 'pool' ? 'border-secondary bg-[#F3F8F4]' : 'border-border bg-card'}`}
        >
          <div className="mb-2 flex items-center gap-2">
            <Badge tone="green">公積金</Badge>
          </div>
          <p className="font-medium text-foreground">先把錢存進共同池，再從池內支出</p>
          <p className="mt-1 text-sm text-muted-foreground">適合先集資後統一支付，減少每筆小額付款者紀錄負擔。</p>
        </button>
      </div>

      {modeChanged ? (
        <div className="rounded-2xl border border-[#E8C7A8] bg-[#FFF4E8] px-4 py-3 text-sm text-[#8A5A2B]">
          切換記帳模式後，既有明細與結算會重置。
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-3 pt-5">
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="font-medium">建立後建議下一步</p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            先邀請旅伴加入，再開始記錄支出。如果你選擇公積金模式，建立完成後可先新增第一筆共同資金。
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {isEditing && canDeleteTrip ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={mutationPending}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#EBCACA] bg-[#FFF5F5] text-[#C96B6B]"
          >
            {deleteTripMutation.isPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        ) : null}
        {mutationPending ? (
          <span className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-border bg-card px-4 font-medium text-muted-foreground opacity-60">
            取消
          </span>
        ) : (
          <Link
            to={isEditing && editingTrip ? `/trip/${editingTrip.id}/manage` : '/'}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-border bg-card px-4 font-medium text-foreground transition-all hover:bg-white"
          >
            取消
          </Link>
        )}
        <Button size="lg" className="flex-1" onClick={handleSubmit} disabled={!title.trim() || mutationPending}>
          {deleteTripMutation.isPending ? '刪除中...' : submitPending ? '儲存中...' : submitLabel}
        </Button>
      </div>

    </div>
  )
}
