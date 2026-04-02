import { useEffect, useState } from 'react'

import { TopNavigation } from '../components/shared'
import { getUserInfo, getZhiList } from '../services/api'
import type { UserInfo, ZhiListItem } from '../services/api'
import type { CopyText, LanguageOption } from '../types'

function shortenAddress(addr: string) {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function formatDate(dateStr: string) {
  return dateStr.slice(0, 16).replace('T', ' ')
}

export function CommunityScreen({
  copy,
  currentLanguage,
  walletButtonLabel,
  authToken,
  onMenuToggle,
  onLanguageToggle,
  onWalletConnect,
  onFeedback,
}: {
  copy: CopyText
  currentLanguage: LanguageOption
  walletButtonLabel: string
  authToken: string | null
  onMenuToggle: () => void
  onLanguageToggle: () => void
  onWalletConnect: () => void
  onFeedback: (msg: string) => void
}) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [zhiList, setZhiList] = useState<ZhiListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authToken) return
    setLoading(true)

    Promise.all([getUserInfo(authToken), getZhiList(authToken)])
      .then(([info, list]) => {
        setUserInfo(info)
        setZhiList(list)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [authToken])

  const inviteCode = userInfo?.code ?? ''
  const inviteUrl = inviteCode
    ? `${window.location.origin}?code=${inviteCode}`
    : ''
  const inviteDisplay = inviteUrl || '—'

  const handleCopy = async () => {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      onFeedback(copy.inviteCopied)
    } catch {
      onFeedback('Copy failed')
    }
  }

  const teamTotal = userInfo?.team_num ?? 0
  const teamDirect = userInfo?.zhi_num ?? 0
  const teamIndirect = teamTotal - teamDirect

  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_#08060a_0%,_#12100a_40%,_#0a0804_100%)]" />
      <div
        className="absolute inset-x-0 top-[60px] h-[900px] bg-cover bg-top opacity-80"
        style={{ backgroundImage: 'url(/figma/subscription-bg.webp)' }}
      />
      <div
        className="absolute inset-x-0 top-[60px] h-[760px] bg-cover bg-top opacity-70 mix-blend-screen"
        style={{ backgroundImage: 'url(/figma/subscription-overlay.webp)' }}
      />

      <TopNavigation
        copy={copy}
        currentLanguage={currentLanguage}
        walletButtonLabel={walletButtonLabel}
        onMenuToggle={onMenuToggle}
        onLanguageToggle={onLanguageToggle}
        onWalletConnect={onWalletConnect}
      />

      <div className="relative z-10 px-4 pb-16 pt-[52px]">
        {/* Header */}
        <div className="mb-7 mt-5">
          <h1 className="bg-[linear-gradient(90deg,_#ffe88a,_#f2bf3e)] bg-clip-text text-[24px] font-extrabold leading-tight text-transparent">
            {copy.communityTitle}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-white/45">
            {copy.communityDesc}
          </p>
        </div>

        {/* Invite Card */}
        <div className="relative mb-6 overflow-hidden rounded-[20px]">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,_#43391f_0%,_#4a4020_40%,_#3d351c_100%)]" />
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#fad933]/[0.12] blur-[40px]" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[#c8922a]/[0.10] blur-[30px]" />
          <div className="relative px-5 pb-5 pt-5">
            <div className="mb-3 flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] text-[#fad933]" stroke="currentColor" strokeWidth="1.8">
                <circle cx="10" cy="8" r="3.5" />
                <path d="M4.5 18c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
                <path d="M18 8v6" />
                <path d="M15 11h6" />
              </svg>
              <span className="text-[14px] font-bold text-white/90">{copy.inviteTitle}</span>
            </div>
            <p className="mb-4 text-[12px] leading-[1.6] text-white/40">{copy.inviteDesc}</p>

            <div className="mb-4 rounded-[12px] bg-black/25 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-[#fad933]/70" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-white/50">{inviteDisplay}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!inviteUrl}
              className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[linear-gradient(135deg,_#ffe566,_#fad933,_#d4a32a)] py-3 text-[13px] font-bold text-[#1a1200] shadow-[0_4px_24px_rgba(250,217,51,0.35)] transition-all active:scale-[0.98] disabled:opacity-35"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copy.inviteCopy}
            </button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 px-1">
            <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] text-[#fad933]" stroke="currentColor" strokeWidth="1.7">
              <path d="M4 17c0-2.2 1.8-4 4-4s4 1.8 4 4" />
              <path d="M12 17c0-1.9 1.6-3.5 3.5-3.5S19 15.1 19 17" />
              <circle cx="8" cy="9" r="2.5" />
              <circle cx="16" cy="9.5" r="2" />
            </svg>
            <span className="text-[14px] font-bold text-white/90">{copy.teamTitle}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: copy.teamTotal, value: teamTotal, accent: true },
              { label: copy.teamDirect, value: teamDirect, accent: false },
              { label: copy.teamIndirect, value: teamIndirect, accent: false },
            ].map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-[14px] bg-[linear-gradient(160deg,_rgba(255,255,255,0.10),_rgba(255,255,255,0.05))] px-3 py-4 text-center"
              >
                {stat.accent ? (
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-[linear-gradient(90deg,_transparent,_#fad933_50%,_transparent)] opacity-50" />
                ) : null}
                <p className={`text-[22px] font-extrabold leading-none ${stat.accent ? 'bg-[linear-gradient(90deg,_#ffe88a,_#f2bf3e)] bg-clip-text text-transparent' : 'text-white/75'}`}>
                  {loading ? '—' : stat.value}
                </p>
                <p className="mt-1.5 text-[10px] font-medium tracking-wide text-white/35">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Referral List */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] text-[#fad933]" stroke="currentColor" strokeWidth="1.8">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span className="text-[14px] font-bold text-white/90">{copy.teamDirect}</span>
            </div>
            <span className="text-[12px] tabular-nums text-white/55">{zhiList.length} 人</span>
          </div>

          {/* Table header */}
          <div className="mb-1 flex items-center px-4 py-1.5 text-[10px] font-medium tracking-wide text-white/45">
            <span className="flex-1">地址</span>
            <span className="w-16 text-center">團隊</span>
            <span className="w-[88px] text-right">註冊時間</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-[13px] text-white/30">Loading…</div>
          ) : zhiList.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-white/30">暫無數據</div>
          ) : (
            <div className="space-y-1.5">
              {zhiList.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center rounded-[12px] bg-white/[0.07] px-4 py-3 transition hover:bg-white/[0.10]"
                >
                  <div className="flex flex-1 items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{
                        background: idx < 3
                          ? 'linear-gradient(135deg, rgba(250,217,51,0.2), rgba(200,146,42,0.1))'
                          : 'rgba(255,255,255,0.04)',
                        color: idx < 3 ? '#fad933' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <span className="truncate font-mono text-[12px] text-white/85">{shortenAddress(item.address)}</span>
                  </div>
                  <span className="w-16 text-center text-[12px] tabular-nums text-white/70">{item.team_num}</span>
                  <span className="w-[88px] text-right text-[10px] tabular-nums text-white/55">{formatDate(item.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="mt-10 flex flex-col items-center gap-3 pb-6">
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#fad933]/30 to-transparent" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/25">
            MCG · Digital Gold
          </p>
        </footer>
      </div>
    </>
  )
}
