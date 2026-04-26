import { useState, useEffect, useRef } from 'react'
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
    alert('复制成功')
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    alert('复制成功')
  }
}

// --- Stat icon card (small, side-by-side) ---
function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="flex gap-[23px] rounded-[10px] bg-[#1e1e1e] px-3.5 py-4" style={{ width: 168, height: 122 }}>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm text-white/70">{label}</span>
        <span className="text-[22px] font-bold leading-5">{value}</span>
      </div>
      <img src={icon} alt="" className="mt-7 h-[60px] w-[60px] shrink-0 object-contain" />
    </div>
  )
}

// --- Performance row ---
function PerfRow({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[14px] bg-[#1e1e1e] px-3.5 py-2.5">
      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-b from-[#fff8c3] via-[#ff9a02] to-[#ffdf50]">
        <img src={icon} alt="" className="h-[22px] w-[22px]" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-white/70">{label}</span>
        <span className="text-lg font-bold leading-5">{fmtNum(value)}</span>
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

type UserPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function UserPage({ onNavigate }: UserPageProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [teamList, setTeamList] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
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
      <div className="relative h-[260px] w-full bg-cover bg-top bg-no-repeat" style={{ backgroundImage: "url('/old-pages/team/team-user-bg.png')" }} />

      {/* content */}
      <div className="-mt-8 px-4 pb-32">
        {/* invite cards */}
        <div className="flex flex-col gap-3.5">
          <InviteCard icon="/old-pages/team/user-invite-code.png" label="邀请码" value={userInfo?.code || '--'} onCopy={() => copyText(userInfo?.code || '')} />
          <InviteCard icon="/old-pages/team/user-invite-user.png" label="邀请链接" value={inviteLink} onCopy={() => copyText(inviteLink)} />
        </div>

        {/* stat cards row */}
        <div className="mt-3.5 flex justify-center gap-2.5">
          <StatCard icon="/old-pages/team/user-share.svg" label="直推人数" value={fmtNum(userInfo?.zhi_num)} />
          <StatCard icon="/old-pages/team/user-team.svg" label="团队人数" value={fmtNum(userInfo?.team_num)} />
        </div>

        {/* performance rows */}
        <div className="mt-3.5 flex flex-col gap-4">
          <PerfRow icon="/old-pages/team/team-mark.svg" label="个人业绩" value={userInfo?.me_performance ?? 0} />
          <PerfRow icon="/old-pages/team/team-perform.svg" label="团队业绩" value={userInfo?.team_performance ?? 0} />
        </div>

        {/* team list */}
        <div className="mt-3.5 rounded-[14px] bg-[#1e1e1e] px-3.5 pb-6 pt-4">
          <div className="flex items-center justify-between text-xs text-[#9fa0a3]">
            <span>成员</span>
            <span>业绩</span>
          </div>
          {teamList.length === 0 ? (
            <div className="py-10 text-center text-sm text-white/40">暂无团队成员</div>
          ) : (
            <div className="mt-3 flex flex-col gap-5">
              {teamList.map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-black">
                      {(m.address || '?')[0]}
                    </div>
                    <span className="text-sm">{truncateAddr(m.address)}</span>
                    <span className="rounded-full bg-[#fbd005] px-1.5 py-0.5 text-[11px] font-medium text-[#0d1c3d]">{m.level_name}</span>
                  </div>
                  <span className="text-sm font-medium">{fmtNum(m.performance)}U</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
