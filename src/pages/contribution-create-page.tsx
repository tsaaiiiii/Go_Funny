import { PiggyBank, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeading } from '@/components/ui/section-heading'
import { useGetTripById } from '@/api/generated/trips/trips'
import { useCreateTripContribution } from '@/api/generated/contributions/contributions'
import { formatCurrency } from '@/lib/currency'

export function ContributionCreatePage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: tripResponse } = useGetTripById(tripId!)
  const trip = tripResponse?.data
  const createContributionMutation = useCreateTripContribution()
  const [selectedMembershipId, setSelectedMembershipId] = useState(trip?.memberships[0]?.id ?? '')
  const [amount, setAmount] = useState('3000')
  const [date, setDate] = useState('2025-06-11')

  if (!trip) {
    return null
  }

  const totalContribution = trip.contributions.reduce((sum, item) => sum + item.amount, 0)

  async function handleSubmit() {
    const parsedAmount = Number(amount)
    if (!selectedMembershipId || Number.isNaN(parsedAmount) || parsedAmount <= 0) return

    await createContributionMutation.mutateAsync({
      tripId: trip!.id,
      data: {
        membershipId: selectedMembershipId,
        amount: parsedAmount,
        date,
      },
    })
    await queryClient.invalidateQueries({ queryKey: [`/go-funny-api/trips/${trip!.id}`] })
    navigate(`/trip/${trip!.id}`)
  }

  return (
    <div className="space-y-5 pb-4">
      <MobileHeader title="新增公積金" backTo={`/trip/${trip.id}/manage`} />

      <Card className="border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.96),rgba(243,248,244,0.92))] shadow-float">
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">目前共同池</p>
              <h2 className="text-2xl font-semibold">{formatCurrency(totalContribution)}</h2>
            </div>
            <Badge tone="green">公積金模式</Badge>
          </div>
          <div className="rounded-3xl bg-white/70 p-4 text-sm leading-6 text-muted-foreground">
            這頁只在公積金模式使用。每一筆存入都會影響後續結算結果，因此建議保留存入日期與成員資訊。
          </div>
        </CardContent>
      </Card>

      <SectionHeading title="存入資訊" />

      {trip.mode !== 'pool' ? (
        <EmptyState title="這趟旅程不是公積金模式" description="若要記錄共同池存入，請先把旅程模式調整為公積金。" />
      ) : trip.memberships.length === 0 ? (
        <EmptyState
          title="還沒有成員"
          description="請先回到成員管理頁邀請旅伴加入，才能建立公積金存入紀錄。"
          action={
            <Link to={`/trip/${tripId}/members`} className="inline-flex">
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
                  const active = selectedMembershipId === member.id
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setSelectedMembershipId(member.id)}
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
                <input className="w-full bg-transparent outline-none placeholder:text-muted-foreground" value={amount} onChange={(event) => setAmount(event.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">日期</label>
              <input type="date" className="h-12 w-full rounded-2xl border border-border bg-white px-4 outline-none focus:border-secondary" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
          </CardContent>
        </Card>
      )}

      <Button size="lg" variant="secondary" className="w-full gap-2" onClick={handleSubmit} disabled={!selectedMembershipId || Number(amount) <= 0}>
        <Plus className="h-4 w-4" />
        儲存存入紀錄
      </Button>
    </div>
  )
}
