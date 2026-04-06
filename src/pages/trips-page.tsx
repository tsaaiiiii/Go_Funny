import { CalendarDays, Pencil, PiggyBank, Plane, SquarePen, Users, Wallet, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

import { MobileHeader } from '@/components/layout/mobile-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/ui/section-heading'
import { useGetTrips } from '@/api/generated/trips/trips'
import { authClient } from '@/lib/auth-client'
import { formatCurrency } from '@/lib/currency'

interface MockSession {
  user: {
    email: string
    name: string
  }
}

export function TripsPage() {
  const { data: session } = authClient.useSession()
  const { data: tripsResponse } = useGetTrips()
  const trips = tripsResponse?.data ?? []
  const [mockSession, setMockSession] = useState<MockSession | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [profileStatus, setProfileStatus] = useState('')
  const sortedTrips = useMemo(
    () =>
      trips
        .slice()
        .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime() || new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [trips],
  )
  const totalExpense = trips.reduce(
    (sum, trip) => sum + trip.expenses.reduce((tripSum, expense) => tripSum + expense.amount, 0),
    0,
  )
  const currentUser = session?.user ?? mockSession?.user

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('mock-auth-session')
      setMockSession(stored ? (JSON.parse(stored) as MockSession) : null)
    } catch {
      setMockSession(null)
    }
  }, [])

  function openProfileModal() {
    setDraftName(currentUser?.name ?? '')
    setProfileStatus('')
    setProfileModalOpen(true)
  }

  function handleSaveProfile() {
    const nextName = draftName.trim()
    if (!nextName) {
      setProfileStatus('名稱不可為空白')
      return
    }

    if (mockSession) {
      const nextSession = {
        ...mockSession,
        user: {
          ...mockSession.user,
          name: nextName,
        },
      }
      window.localStorage.setItem('mock-auth-session', JSON.stringify(nextSession))
      setMockSession(nextSession)
      setProfileStatus('更新成功')
      window.setTimeout(() => setProfileModalOpen(false), 400)
      return
    }

    setProfileStatus('目前僅 mock 登入可直接修改名稱')
  }

  return (
    <div className="space-y-5 pb-3">
      <MobileHeader title="Go Funny" />

      <Card className="overflow-hidden border-none bg-[linear-gradient(135deg,rgba(95,168,184,0.92),rgba(127,167,138,0.82))] text-white shadow-float">
        <CardContent className="space-y-4 p-5">
          <div className="space-y-2">
            <p className="text-sm text-white/80">這次旅行，帳目清清楚楚</p>
            <h2 className="text-2xl font-semibold leading-tight">用最自然的方式記錄每一筆旅途花費。</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/16 p-3 backdrop-blur-sm">
              <p className="text-xs text-white/75">進行中旅程</p>
              <p className="mt-1 text-xl font-semibold">{trips.length}</p>
            </div>
            <div className="rounded-2xl bg-white/16 p-3 backdrop-blur-sm">
              <p className="text-xs text-white/75">總支出</p>
              <p className="mt-1 text-xl font-semibold">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
          <Link to="/trip/new" className="block">
            <Button variant="outline" className="w-full border-white/35 bg-white/18 text-white hover:bg-white/22">
              建立新旅程
            </Button>
          </Link>
        </CardContent>
      </Card>

      {currentUser ? (
        <Card>
          <CardContent className="space-y-3 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">帳號資訊</p>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="green">已登入</Badge>
                <button
                  type="button"
                  aria-label="修改個人 info"
                  onClick={openProfileModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D8E8EB] bg-[#F4FAFB] text-primary transition-colors hover:bg-[#EAF4F7]"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="rounded-2xl bg-[#F6FBFC] px-4 py-3">
              <p className="text-xs text-muted-foreground">名稱</p>
              <p className="mt-1 text-base font-semibold text-foreground">{currentUser.name || '未設定名稱'}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-3 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">帳號與同步</p>
                <p className="text-sm text-muted-foreground">之後可使用 Better Auth 與 Google 進行登入。</p>
              </div>
              <Badge tone="blue">Beta</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/login" className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-all hover:bg-white">
                登入
              </Link>
              <Link to="/register" className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:bg-[#4E99A9]">
                註冊
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <SectionHeading title="你的旅程" />

      <div className="space-y-4">
        {trips.length === 0 ? (
          <EmptyState
            icon={<Plane className="h-6 w-6" />}
            title="還沒有旅程"
            description="先建立第一趟旅行，接著再加入旅伴與支出。"
            action={
              <Link to="/trip/new" className="inline-flex">
                <Button>建立第一個旅程</Button>
              </Link>
            }
          />
        ) : (
          sortedTrips.map((trip) => {
            const totalExpenseByTrip = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0)

            return (
              <Card key={trip.id} className="overflow-hidden transition-transform duration-200 active:scale-[0.99]">
                  <CardContent className="space-y-4 pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge tone={trip.mode === 'expense' ? 'blue' : 'green'}>
                          {trip.mode === 'expense' ? '一般記帳' : '公積金'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{trip.location || '尚未設定地點'}</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{trip.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link
                      to={`/trip/${trip.id}/manage`}
                      aria-label="編輯旅程"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D8E8EB] bg-[#F4FAFB] text-primary transition-colors hover:bg-[#EAF4F7]"
                    >
                      <SquarePen className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-2xl bg-[#F6FBFC] p-3">
                        <div className="mb-1 flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          成員
                        </div>
                        <p className="font-semibold">{trip.memberships.length} 位</p>
                      </div>
                      <div className="rounded-2xl bg-[#F8FBF8] p-3">
                        <div className="mb-1 flex items-center gap-1 text-muted-foreground">
                          <Wallet className="h-4 w-4" />
                          支出
                        </div>
                        <p className="font-semibold">{formatCurrency(totalExpenseByTrip)}</p>
                      </div>
                      <div className="rounded-2xl bg-[#FAF7F3] p-3">
                        <div className="mb-1 flex items-center gap-1 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          紀錄
                        </div>
                        <p className="font-semibold">{trip.expenses.length + trip.contributions.length} 筆</p>
                      </div>
                    </div>

                    <div className={`grid gap-3 ${trip.mode === 'pool' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      <Link
                        to={`/trip/${trip.id}`}
                        className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:bg-[#4E99A9]"
                      >
                        查看明細
                      </Link>
                      {trip.mode === 'pool' ? (
                        <Link
                          to={`/trip/${trip.id}/new-contribution`}
                          className="inline-flex h-11 items-center justify-center gap-1 rounded-full border border-[#CFE4D4] bg-[#F3FAF5] px-4 text-sm font-medium text-secondary transition-all hover:bg-[#EAF6EE]"
                        >
                          <PiggyBank className="h-4 w-4" />
                          新增公積金
                        </Link>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
            )
          })
        )}
      </div>

      {profileModalOpen && typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-30">
              <div
                className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
                onClick={() => setProfileModalOpen(false)}
                aria-hidden="true"
              />
              <div className="relative flex min-h-full items-center justify-center p-4">
                <div className="w-full max-w-sm rounded-3xl border border-[#D9E8EB] bg-[linear-gradient(180deg,#FCFEFE_0%,#F4FAFB_100%)] p-5 shadow-float">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">修改個人 info</h3>
                      <p className="mt-1 text-sm text-muted-foreground">調整你的顯示名稱</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileModalOpen(false)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D8E8EB] bg-white text-muted-foreground transition-colors hover:bg-[#F3FAFB] hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-white/70 px-3 py-2">
                      <p className="text-[11px] text-muted-foreground">帳號</p>
                      <p className="text-sm font-medium text-foreground">{currentUser?.email}</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">名稱</label>
                      <input
                        className="h-11 w-full rounded-2xl border border-border bg-white px-4 outline-none focus:border-primary"
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                      />
                    </div>

                    {profileStatus ? (
                      <p className={`text-sm ${profileStatus === '更新成功' ? 'text-secondary' : 'text-danger'}`}>
                        {profileStatus}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => setProfileModalOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      儲存
                    </Button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
