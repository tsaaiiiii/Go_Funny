import { CalendarRange, Compass, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MobileHeader } from '@/components/layout/mobile-header'
import { SectionHeading } from '@/components/ui/section-heading'
import { useGetTripById, useCreateTrip, useUpdateTrip, useDeleteTrip } from '@/api/generated/trips/trips'
import type { TripMode } from '@/api/generated/model'

export function TripCreatePage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: tripResponse } = useGetTripById(tripId!, { query: { enabled: !!tripId } })
  const editingTrip = tripResponse?.data
  const isEditing = Boolean(tripId && editingTrip)

  const createTripMutation = useCreateTrip()
  const updateTripMutation = useUpdateTrip()
  const deleteTripMutation = useDeleteTrip()

  const [title, setTitle] = useState(editingTrip?.title ?? '')
  const [location, setLocation] = useState(editingTrip?.location ?? '')
  const [startDate, setStartDate] = useState(editingTrip?.startDate ? new Date(editingTrip.startDate).toISOString().slice(0, 10) : '2025-03-18')
  const [endDate, setEndDate] = useState(editingTrip?.endDate ? new Date(editingTrip.endDate).toISOString().slice(0, 10) : '2025-03-24')
  const [mode, setMode] = useState<TripMode>(editingTrip?.mode ?? 'expense')
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const modeChanged = Boolean(isEditing && editingTrip && mode !== editingTrip.mode)

  useEffect(() => {
    if (!editingTrip) return
    setTitle(editingTrip.title)
    setLocation(editingTrip.location ?? '')
    setStartDate(new Date(editingTrip.startDate).toISOString().slice(0, 10))
    setEndDate(new Date(editingTrip.endDate).toISOString().slice(0, 10))
    setMode(editingTrip.mode)
  }, [editingTrip])

  useEffect(() => {
    if (!saveFeedback) return
    const timeoutId = window.setTimeout(() => setSaveFeedback(null), 2000)
    return () => window.clearTimeout(timeoutId)
  }, [saveFeedback])

  const submitLabel = isEditing ? '儲存變更' : '建立旅程'

  async function handleSubmit() {
    if (!title.trim()) {
      setSaveFeedback({ type: 'error', message: '儲存失敗：請先輸入旅程名稱。' })
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
        await queryClient.invalidateQueries({ queryKey: ['/go-funny-api/trips'] })
        setSaveFeedback({ type: 'success', message: '儲存成功。' })
      } catch {
        setSaveFeedback({ type: 'error', message: '儲存失敗，請稍後再試。' })
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
      await queryClient.invalidateQueries({ queryKey: ['/go-funny-api/trips'] })
      setSaveFeedback(null)
      navigate(`/trip/${result.data.id}/members`)
    } catch {
      setSaveFeedback({ type: 'error', message: '建立失敗，請稍後再試。' })
    }
  }

  async function handleDelete() {
    if (!editingTrip) return

    try {
      await deleteTripMutation.mutateAsync({ tripId: editingTrip.id })
      await queryClient.invalidateQueries({ queryKey: ['/go-funny-api/trips'] })
      navigate('/')
    } catch {
      setSaveFeedback({ type: 'error', message: '刪除失敗，請稍後再試。' })
    }
  }

  return (
    <div className="space-y-5 pb-4">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">開始日期</label>
              <div className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-white px-4 focus-within:border-primary">
                <CalendarRange className="h-5 w-5 text-primary" />
                <input type="date" className="w-full bg-transparent outline-none" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">結束日期</label>
              <div className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-white px-4 focus-within:border-primary">
                <CalendarRange className="h-5 w-5 text-primary" />
                <input type="date" className="w-full bg-transparent outline-none" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </div>
            </div>
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
        {isEditing ? (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#EBCACA] bg-[#FFF5F5] text-[#C96B6B]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
        <Link
          to={isEditing && editingTrip ? `/trip/${editingTrip.id}/manage` : '/'}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-border bg-card px-4 font-medium text-foreground transition-all hover:bg-white"
        >
          取消
        </Link>
        <Button size="lg" className="flex-1" onClick={handleSubmit} disabled={!title.trim()}>
          {submitLabel}
        </Button>
      </div>

      {isEditing && saveFeedback ? (
        <div className="pointer-events-none fixed right-4 top-4 z-30 sm:right-6 sm:top-6">
          <div
            className={`rounded-xl px-4 py-2.5 text-sm shadow-soft ${
              saveFeedback.type === 'success'
                ? 'border border-[#3C8F67] bg-[#3C8F67] text-white shadow-[0_8px_24px_rgba(60,143,103,0.35)]'
                : 'border border-[#C25757] bg-[#C25757] text-white shadow-[0_8px_24px_rgba(194,87,87,0.35)]'
            }`}
          >
            {saveFeedback.message}
          </div>
        </div>
      ) : null}
    </div>
  )
}
