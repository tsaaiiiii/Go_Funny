import { AlertTriangle, Copy, Plus, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeading } from '@/components/ui/section-heading'
import { useAppData } from '@/lib/app-data'

export function MembersPage() {
  const { tripId } = useParams()
  const { addMember, deleteMember, getTripById } = useAppData()
  const trip = getTripById(tripId)
  const [draftName, setDraftName] = useState('')
  const [copied, setCopied] = useState(false)

  if (!trip) {
    return null
  }

  const currentTrip = trip

  function hasExpenseRecord(memberId: string) {
    return currentTrip.expenses.some(
      (expense) =>
        expense.payerId === memberId ||
        expense.participants.includes(memberId) ||
        Boolean(expense.splits?.some((split) => split.memberId === memberId)),
    )
  }

  function handleAddMember() {
    if (!draftName.trim()) {
      return
    }

    addMember(currentTrip.id, draftName)
    setDraftName('')
  }

  async function handleCopyInviteLink() {
    const inviteLink = `${window.location.origin}/trip/${currentTrip.id}/join?invite=${currentTrip.id}`

    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-5 pb-4">
      <MobileHeader title="成員管理" backTo={`/trip/${currentTrip.id}/manage`} />

      <Card className="border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.96),rgba(243,248,244,0.92))] shadow-float">
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">旅伴名單</p>
              <h2 className="text-2xl font-semibold">{currentTrip.members.length} 位成員</h2>
            </div>
            <Badge tone="green">可隨時新增</Badge>
          </div>
        </CardContent>
      </Card>

      <SectionHeading title="新增成員" />

      <Card className="border-none bg-[linear-gradient(180deg,rgba(244,250,251,0.96),rgba(248,252,252,0.92))]">
        <CardContent className="space-y-3 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">邀請好友加入</p>
              <p className="text-sm text-muted-foreground">複製邀請連結分享給旅伴</p>
            </div>
            <Badge tone="blue">協作</Badge>
          </div>

          <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-muted-foreground">
            {`/trip/${currentTrip.id}/join?invite=${currentTrip.id}`}
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={handleCopyInviteLink}>
            <Copy className="h-4 w-4" />
            {copied ? '已複製連結' : '複製邀請連結'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-5">
          <input
            className="h-12 w-full rounded-2xl border border-border bg-white px-4 outline-none placeholder:text-muted-foreground focus:border-primary"
            placeholder="例如：Mina"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
          />
          <Button className="w-full gap-2" onClick={handleAddMember} disabled={!draftName.trim()}>
            <Plus className="h-4 w-4" />
            新增成員
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <SectionHeading title="目前成員" />
        <p className="inline-flex items-center gap-1 text-right text-xs font-medium text-danger">
          <AlertTriangle className="h-3.5 w-3.5" />
          已有支出紀錄的成員不可刪除
        </p>
      </div>

      <div className="space-y-3">
        {currentTrip.members.length === 0 ? (
          <EmptyState title="尚未加入旅伴" description="先加入至少一位成員，之後才能記錄支出或存入公積金。" />
        ) : currentTrip.members.map((member) => {
          const locked = hasExpenseRecord(member.id)

          return (
            <Card key={member.id}>
              <CardContent className="flex items-center justify-between gap-3 pt-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${member.color}`}>
                    {member.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {locked ? '已有支出紀錄，不可刪除' : '旅伴'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteMember(currentTrip.id, member.id)}
                  disabled={locked}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                    locked
                      ? 'cursor-not-allowed border-border bg-[#F4F7F8] text-muted-foreground'
                      : 'border-[#EBCACA] bg-[#FFF5F5] text-[#C96B6B]'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
