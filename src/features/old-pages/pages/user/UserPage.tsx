import { useState, useEffect, useRef } from 'react'
import { NoticePopup } from '../../components/NoticePopup'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchUserInfoOld, fetchTeamList } from '../../services/api'
import type { UserInfo, TeamMember } from '../../services/types'
import type { AppPage, PageParams } from '../../../figma/types'

function truncateAddr(addr: string) {
  if (!addr || addr.length < 12) return addr || '--'
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function fmtNum(n: number | string | undefined) {
  return Number(n || 0).toLocaleString()
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

// --- Stat icon card (small, side-by-side) ---
function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="flex h-[122px] w-full gap-[23px] rounded-[10px] bg-[#1e1e1e] px-3.5 py-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm text-white/70">{label}</span>
        <span className="text-[22px] font-bold leading-5">{value}</span>
      </div>
      <img src={icon} alt="" className="mt-7 h-[60px] w-[60px] shrink-0 object-contain" />
    </div>
  )
}

// --- Performance row ---
function PerfRow({
  icon,
  label,
  value,
  extraLabel,
  extraValue,
}: {
  icon: string
  label: string
  value: string | number
  extraLabel?: string
  extraValue?: string | number
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-[14px] bg-[#1e1e1e] px-3.5 py-2.5">
      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-b from-[#fff8c3] via-[#ff9a02] to-[#ffdf50]">
        <img src={icon} alt="" className="h-[22px] w-[22px]" />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm text-white/70">{label}</span>
          <span className="text-lg font-bold leading-5">{fmtNum(value)}</span>
        </div>
        {extraLabel ? (
          <div className="shrink-0 rounded-[12px] border border-[#f6d36b]/20 bg-[linear-gradient(180deg,rgba(255,241,147,0.12)_0%,rgba(235,165,0,0.08)_100%)] px-3 py-2 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="text-[11px] leading-4 text-[#f7e7b0]/70">{extraLabel}</div>
            <div className="text-sm font-bold leading-4 text-[#ffe28a]">{fmtNum(extraValue)}</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// --- Invite card ---
function InviteCard({ icon, label, value, onCopy }: { icon: string; label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[14px] border border-white/20 bg-gradient-to-br from-[#fff193] to-[#eba500] px-2.5 py-2.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-black">
        <img src={icon} alt="" className="h-[22px] w-[22px]" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm text-[#0d1c3d]">{label}</span>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-base font-bold text-[#0d1c3d]">{value}</span>
          <button type="button" onClick={onCopy} className="shrink-0 active:opacity-60" aria-label="复制">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d1c3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function UserLevelCard({ levelId }: { levelId?: number }) {
  const levelText = typeof levelId === 'number' ? `T${Math.max(levelId - 1, 0)}` : '--'

  return (
    <div className="relative overflow-hidden rounded-[16px] border border-[#f6d36b]/30 bg-[linear-gradient(135deg,#2a220f_0%,#151515_48%,#2e2106_100%)] px-4 py-4 shadow-[0_10px_30px_rgba(235,165,0,0.18)]">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#f6d36b]/10 blur-2xl" />
      <div className="absolute -bottom-8 left-8 h-20 w-20 rounded-full bg-[#eba500]/10 blur-2xl" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-[#f7e7b0]/70">当前用户等级</span>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-[30px] font-black leading-none text-[#ffe28a]">{levelText}</span>
            <span className="mb-1 text-xs tracking-[0.2em] text-[#f7e7b0]/60">LEVEL</span>
          </div>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border border-[#ffe28a]/25 bg-[linear-gradient(180deg,rgba(255,226,138,0.22)_0%,rgba(235,165,0,0.12)_100%)]">
          <span className="text-[22px] text-[#ffe28a]">✦</span>
        </div>
      </div>
    </div>
  )
}

type UserPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function UserPage({ onNavigate }: UserPageProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [teamList, setTeamList] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    Promise.all([fetchUserInfoOld(), fetchTeamList()])
      .then(([u, t]) => { setUserInfo(u); setTeamList(t) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const inviteLink = userInfo?.code
    ? `${window.location.origin}/#/index?code=${userInfo.code}`
    : '--'

  const handleCopy = async (text: string) => {
    if (!text || text === '--') return
    await copyText(text)
    setNoticeMessage('复制成功')
  }

  if (loading) {
    return (
      <PageContainer>
        <PageNavBar title="我的团队" onBack={() => onNavigate('home')} />
        <div className="flex flex-col items-center gap-2 py-32">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-amber-400" />
          <span className="text-sm text-white/40">加载中...</span>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageNavBar title="我的团队" onBack={() => onNavigate('home')} />

      {/* hero bg */}
      <div
        className="relative h-[514px] w-full bg-top bg-no-repeat"
        style={{
          backgroundImage: "url('/old-pages/team/team-user-bg.png')",
          backgroundSize: '100% 100%',
        }}
      />

      {/* content */}
      <div className="relative z-10 -mt-[30px] px-[15px] pb-[120px]">
        {/* invite cards */}
        <div className="flex flex-col gap-[14px]">
          <InviteCard
            icon="/old-pages/team/user-invite-code.png"
            label="邀请码"
            value={userInfo?.code || '--'}
            onCopy={() => void handleCopy(userInfo?.code || '')}
          />
          <InviteCard
            icon="/old-pages/team/user-invite-user.png"
            label="邀请链接"
            value={inviteLink}
            onCopy={() => void handleCopy(inviteLink)}
          />
        </div>

        <div className="mt-[14px]">
          <UserLevelCard levelId={userInfo?.level_id} />
        </div>

        {/* stat cards row */}
        <div className="mt-[14px] grid grid-cols-2 gap-[9px]">
          <StatCard
            icon="/old-pages/team/user-share.svg"
            label="直推人数"
            value={fmtNum(userInfo?.zhi_num)}
          />
          <StatCard
            icon="/old-pages/team/user-team.svg"
            label="团队人数"
            value={fmtNum(userInfo?.team_num)}
          />
        </div>

        {/* performance rows */}
        <div className="mt-[14px] flex flex-col gap-[15px]">
          <PerfRow
            icon="/old-pages/team/team-mark.svg"
            label="个人业绩"
            value={userInfo?.self_yeji ?? 0}
          />
          <PerfRow
            icon="/old-pages/team/team-perform.svg"
            label="团队业绩"
            value={userInfo?.team_yeji ?? 0}
            extraLabel="小区业绩"
            extraValue={userInfo?.small_yeji ?? 0}
          />
        </div>

        {/* team list */}
        <div className="mt-[14px] rounded-[14px] bg-[#1e1e1e] px-[13px] pb-[26px] pt-[18px]">
          <div className="flex items-center justify-between text-xs text-[#9fa0a3]">
            <span>成员</span>
            <span>业绩</span>
          </div>
          {teamList.length === 0 ? (
            <div className="py-10 text-center text-sm text-white/40">
              暂无团队成员
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-5">
              {teamList.map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-black">
                      {(m.address || '?')[0]}
                    </div>
                    <span className="text-sm">{truncateAddr(m.address)}</span>
                    <span className="rounded-full bg-[#fbd005] px-1.5 py-0.5 text-[11px] font-medium text-[#0d1c3d]">
                      {m.level_name}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {fmtNum(m.total_yeji)}U
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <NoticePopup
        visible={noticeMessage !== null}
        message={noticeMessage ?? ''}
        onClose={() => setNoticeMessage(null)}
      />
    </PageContainer>
  )
}
