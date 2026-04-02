import { useEffect, useState } from 'react'

import { TopNavigation } from '../components/shared'
import { getUserInfo, getZhiList } from '../services/api'
import type { UserInfo, ZhiListItem } from '../services/api'
import type { CopyText, LanguageOption } from '../types'

const sectionCardClass =
  'rounded-[24px] border border-black/5 bg-white shadow-[0_8px_24px_rgba(200,164,54,0.18)]'

const softCardClass =
  'rounded-[18px] border border-black/5 bg-[#fffdf7] shadow-[0_6px_18px_rgba(200,164,54,0.12)]'

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
  const [loading, setLoading] = useState(Boolean(authToken))

  useEffect(() => {
    if (!authToken) return
    let cancelled = false

    const timer = window.setTimeout(() => {
      setLoading(true)

      Promise.all([getUserInfo(authToken), getZhiList(authToken)])
        .then(([info, list]) => {
          if (cancelled) return
          setUserInfo(info)
          setZhiList(list)
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) {
            setLoading(false)
          }
        })
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [authToken])

  const displayUserInfo = authToken ? userInfo : null
  const displayZhiList = authToken ? zhiList : []

  const inviteCode = displayUserInfo?.code ?? ''
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

  const teamTotal = displayUserInfo?.team_num ?? 0
  const teamDirect = displayUserInfo?.zhi_num ?? 0
  const teamIndirect = teamTotal - teamDirect
  const statCards = [
    { label: copy.teamTotal, value: teamTotal, accent: true, helper: 'All Members' },
    { label: copy.teamDirect, value: teamDirect, accent: false, helper: 'Direct Referrals' },
    { label: copy.teamIndirect, value: teamIndirect, accent: false, helper: 'Indirect Network' },
  ]

  return (
    <>
      <div className="absolute inset-0 bg-[#f8f8f5]" />
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_top,rgba(250,217,51,0.32),rgba(250,217,51,0.08)_38%,transparent_72%)]" />
      <div className="absolute inset-x-0 top-[150px] h-[300px] bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(248,248,245,1))]" />
      <div className="absolute bottom-0 left-1/2 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-[#fad933]/10 blur-[100px]" />

      <TopNavigation
        copy={copy}
        currentLanguage={currentLanguage}
        walletButtonLabel={walletButtonLabel}
        onMenuToggle={onMenuToggle}
        onLanguageToggle={onLanguageToggle}
        onWalletConnect={onWalletConnect}
      />

      <div className="relative z-10 px-4 pb-16 pt-[70px] text-[#171717]">
        <section className={`${sectionCardClass} px-5 py-5`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d7ab1e]">
            Community Network
          </p>
          <h1 className="mt-2 text-[28px] font-black tracking-[0.02em] text-black">{copy.communityTitle}</h1>
          <p className="mt-2 text-[13px] leading-[22px] text-black/58">{copy.communityDesc}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#fad933]/35 bg-[#fad933]/14 px-3 py-1 text-[10px] font-semibold text-[#c58b1f]">
              Invite & Grow
            </span>
            <span className="rounded-full border border-black/8 bg-black px-3 py-1 text-[10px] font-semibold text-[#fce596]">
              Team Insight
            </span>
          </div>
        </section>

        <section className={`${sectionCardClass} relative mt-6 overflow-hidden px-5 py-5`}>
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#fad933]/18 blur-[48px]" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-[#f2c44d]/14 blur-[34px]" />
          <div className="relative">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d7ab1e]">Invite Link</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fad933]/16 text-[#c58b1f]">
                    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="10" cy="8" r="3.5" />
                      <path d="M4.5 18c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
                      <path d="M18 8v6" />
                      <path d="M15 11h6" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[18px] font-black text-black">{copy.inviteTitle}</h2>
                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-black/35">
                      Referral Access
                    </p>
                  </div>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-black/8 bg-[#fffaf0] px-3 py-1 text-[10px] font-semibold text-black/45">
                Link Ready
              </span>
            </div>

            <p className="text-[12px] leading-[20px] text-black/58">{copy.inviteDesc}</p>

            <div className={`${softCardClass} mt-4 px-4 py-3`}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/6 text-[#c58b1f]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">Share URL</p>
                  <p className="mt-1 truncate font-mono text-[11px] text-black/62">{inviteDisplay}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!inviteUrl}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] bg-black py-3 text-[13px] font-bold text-[#fce596] shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition active:scale-[0.985] disabled:opacity-35"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copy.inviteCopy}
            </button>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d7ab1e]">Team Overview</p>
              <h2 className="mt-1 text-[20px] font-black text-black">{copy.teamTitle}</h2>
            </div>
            <span className="rounded-full border border-black/8 bg-white px-3 py-1 text-[10px] font-semibold text-black/45 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              Network Stats
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className={[
                  softCardClass,
                  'relative overflow-hidden px-3 py-4 text-center',
                  stat.accent ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(251,208,5,0.16)_100%)]' : '',
                ].join(' ')}
              >
                {stat.accent ? (
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-linear-to-r from-transparent via-[#fad933] to-transparent" />
                ) : null}
                <p
                  className={[
                    'text-[22px] font-extrabold leading-none',
                    stat.accent ? 'text-[#b47a16]' : 'text-black/75',
                  ].join(' ')}
                >
                  {loading ? '—' : stat.value}
                </p>
                <p className="mt-2 text-[10px] font-semibold tracking-[0.04em] text-black/55">{stat.label}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-black/28">{stat.helper}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`${sectionCardClass} mt-6 px-4 py-5`}>
          <div className="mb-4 flex items-center justify-between gap-3 px-1">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fad933]/16 text-[#c58b1f]">
                <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.8">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d7ab1e]">Referral Members</p>
                <h2 className="mt-1 truncate text-[18px] font-black text-black">{copy.teamDirect}</h2>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-black/8 bg-[#fffaf0] px-3 py-1 text-[10px] font-semibold text-black/45">
              {displayZhiList.length} 人
            </span>
          </div>

          <div className="mb-2 flex items-center rounded-[14px] border border-black/5 bg-[#fffdf7] px-4 py-2 text-[10px] font-semibold tracking-[0.12em] text-black/38">
            <span className="flex-1">地址</span>
            <span className="w-16 text-center">團隊</span>
            <span className="w-[88px] text-right">註冊時間</span>
          </div>

          {loading ? (
            <div className={`${softCardClass} py-8 text-center text-[13px] text-black/38`}>Loading…</div>
          ) : displayZhiList.length === 0 ? (
            <div className={`${softCardClass} py-8 text-center text-[13px] text-black/38`}>暫無數據</div>
          ) : (
            <div className="space-y-2">
              {displayZhiList.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center rounded-[16px] border border-black/5 bg-[#fffdf8] px-4 py-3 shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:border-[#fad933]/35 hover:bg-white"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{
                        background:
                          idx < 3
                            ? 'linear-gradient(135deg, rgba(251,208,5,0.28), rgba(255,255,255,0.96))'
                            : 'rgba(0,0,0,0.04)',
                        color: idx < 3 ? '#b47a16' : 'rgba(0,0,0,0.48)',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <span className="truncate font-mono text-[12px] text-black/78">{shortenAddress(item.address)}</span>
                  </div>
                  <span className="w-16 text-center text-[12px] font-medium tabular-nums text-black/68">{item.team_num}</span>
                  <span className="w-[88px] text-right text-[10px] tabular-nums text-black/42">{formatDate(item.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-12 flex flex-col items-center gap-3 pb-6">
          <div className="h-px w-20 bg-linear-to-r from-transparent via-[#d8b13a]/70 to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-black/30">
            MCG Community · Invite on Chain
          </p>
        </footer>
      </div>
    </>
  )
}
