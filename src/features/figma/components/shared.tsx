import { useEffect, useRef, useState } from 'react'

import {
  brandLogoUrl,
  languageOptions,
  menuItems,
} from '../data'
import type { CopyText, LanguageOption } from '../types'
import type { NoticeItem } from '../services/api'
import { ChevronRight, CloseIcon } from './icons'

export function NoticeBar({
  notices,
  onSelect,
}: {
  notices: NoticeItem[]
  onSelect: (notice: NoticeItem) => void
}) {
  const [activeIdx, setActiveIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (notices.length <= 1) return
    timerRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % notices.length)
    }, 4000)
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [notices.length])

  if (notices.length === 0) return null

  const current = notices[activeIdx] ?? notices[0]
  const title = current.title

  return (
    <button
      type="button"
      onClick={() => { if (current) onSelect(current) }}
      className="mb-4 flex w-full items-center gap-2.5 overflow-hidden rounded-[16px] border border-black/5 bg-white px-3 py-2.5 text-left shadow-[0_8px_20px_rgba(200,164,54,0.14)] transition hover:border-[#fad933]/30"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fad933]/18">
        <svg className="h-4 w-4 text-[#d4a32a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
      <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-black/65">{title}</p>
      <svg className="h-4 w-4 shrink-0 text-black/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}

export function NoticeDetailSheet({
  notice,
  isOpen,
  onClose,
}: {
  notice: NoticeItem | null
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] overflow-hidden rounded-t-[22px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.2)] transition-all duration-300 ${
        isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
      style={{ maxHeight: '80vh' }}
    >
      <div className="flex items-center justify-between border-b border-black/6 px-5 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fad933]/15">
            <svg className="h-4 w-4 text-[#d4a32a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <span className="truncate text-[15px] font-bold text-black">{notice?.title ?? ''}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/4 text-black/45 transition hover:bg-black/8"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="overflow-y-auto overscroll-contain px-5 py-5 pb-[calc(24px+env(safe-area-inset-bottom))]" style={{ maxHeight: 'calc(80vh - 64px)' }}>
        <p className="whitespace-pre-line text-[13px] leading-[22px] text-black/60">
          {notice?.content ?? ''}
        </p>
      </div>
    </div>
  )
}

export function TopNavigation({
  copy,
  currentLanguage,
  walletButtonLabel,
  onMenuToggle,
  onLanguageToggle,
  onWalletConnect,
  showBackButton = false,
  onBack,
  overlay = true,
}: {
  copy: CopyText
  currentLanguage: LanguageOption
  walletButtonLabel: string
  onMenuToggle: () => void
  onLanguageToggle: () => void
  onWalletConnect: () => void
  showBackButton?: boolean
  onBack?: () => void
  overlay?: boolean
}) {
  const handleBack = onBack ?? (() => window.history.back())
  const positionClass = overlay ? 'absolute inset-x-0 top-0' : 'relative'

  return (
    <div className={`${positionClass} z-30 flex h-12 items-center justify-between border-b border-black/5 bg-white/90 px-2.5 shadow-[0_4px_10px_rgba(24,28,0,0.06)] backdrop-blur-sm`}>
      {showBackButton ? (
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex h-8 items-center gap-1 rounded-full border border-black/8 bg-white px-2.5 text-[11px] font-semibold text-black/75 shadow-[0_3px_8px_rgba(0,0,0,0.06)] transition hover:text-black"
          aria-label="返回上一页"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          <span>返回</span>
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <img src={brandLogoUrl} alt="logo" className="h-8 w-8 rounded-lg object-cover shadow-[0_3px_8px_rgba(0,0,0,0.08)]" />
          <div className="flex flex-col">
            <span className="text-[13px] font-extrabold leading-tight tracking-wide text-black">
              AUS
            </span>
            <span className="text-[7px] font-medium uppercase tracking-[0.12em] text-black/30">
              Digital Gold
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onWalletConnect}
          className="relative z-30 h-7 max-w-[96px] truncate rounded-full border border-[#fad933]/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(251,208,5,0.22)_100%)] px-2.5 text-[10px] font-semibold text-[#9a6910] shadow-[0_3px_8px_rgba(200,164,54,0.16)]"
        >
          {walletButtonLabel}
        </button>

        <button
          type="button"
          onClick={onLanguageToggle}
          className="relative z-30 flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-black/75 p-[2px]"
          aria-label={copy.languageTitle}
        >
          <img
            src={currentLanguage.flagUrl}
            alt={currentLanguage.label}
            className="h-full w-full rounded-full object-cover"
          />
        </button>

        <button
          type="button"
          onClick={onMenuToggle}
          className="relative z-30 flex h-8 w-8 items-center justify-center rounded-full border border-[#fbd005]/45 bg-white text-[#3a2a05] shadow-[0_0_0_2px_rgba(251,208,5,0.14),0_3px_8px_rgba(0,0,0,0.08)]"
          aria-label="待支付订单"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3h6" />
            <path d="M10 6h4" />
            <rect x="5" y="4" width="14" height="16" rx="2" />
            <path d="M8 11h8" />
            <path d="M8 15h5" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function SideDrawer({
  copy,
  isOpen,
  activeMenu,
  walletAddress,
  onClose,
  onMenuSelect,
  onWalletSwitch,
  onWalletDisconnect,
  onWalletConnect,
}: {
  copy: CopyText
  isOpen: boolean
  activeMenu: string
  walletAddress: string | null
  onClose: () => void
  onMenuSelect: (label: string) => void
  onWalletSwitch: () => void
  onWalletDisconnect: () => void
  onWalletConnect: () => void
}) {
  return (
    <aside
      className={`absolute inset-y-0 left-0 z-30 flex w-[74%] max-w-[308px] flex-col overflow-hidden border-r border-black/5 bg-[#f8f8f5] shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="border-b border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,250,240,0.96)_100%)] px-4 pb-5 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="absolute -inset-[3px] rounded-full bg-[linear-gradient(135deg,rgba(250,217,51,0.45)_0%,rgba(200,146,42,0.18)_100%)] blur-[5px]" />
              <img src={brandLogoUrl} alt="logo" className="relative h-10 w-10 rounded-full object-cover ring-[1.5px] ring-[#fad933]/45" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-[18px] font-extrabold leading-tight tracking-wide text-black">
                AUS
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-black/32">
                Digital Gold
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/8 bg-white text-black/50 shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition hover:bg-[#fffaf0] hover:text-black/70"
            aria-label={copy.menuClose}
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        {walletAddress ? (
          <div className="mt-4 space-y-2.5">
            <div className="rounded-[18px] border border-black/5 bg-white px-3.5 py-3 shadow-[0_8px_18px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/32">Connected Wallet</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full border border-[#fad933]/30 bg-[#fad933]/12 px-2 py-0.5 text-[10px] font-semibold text-[#b47a16]">
                  Active
                </span>
                <span className="truncate text-[13px] font-medium text-black/62">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onWalletSwitch}
                className="flex items-center justify-center gap-1.5 rounded-[14px] border border-black/8 bg-white py-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition hover:bg-[#fffaf0]"
              >
                <svg className="h-3.5 w-3.5 text-[#c58b1f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
                <span className="text-[11px] font-semibold text-black/60">{copy.walletSwitch}</span>
              </button>
              <button
                type="button"
                onClick={onWalletDisconnect}
                className="flex items-center justify-center gap-1.5 rounded-[14px] border border-red-400/18 bg-red-400/6 py-2.5 transition hover:bg-red-400/10"
              >
                <svg className="h-3.5 w-3.5 text-red-500/75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="text-[11px] font-semibold text-red-500/75">{copy.walletDisconnect}</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onWalletConnect}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] bg-black px-3 py-3 text-[#fce596] shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition hover:opacity-95"
          >
            <span className="h-2 w-2 rounded-full bg-[#fad933]" />
            <span className="text-[13px] font-semibold">{copy.walletConnectAction}</span>
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d7ab1e]">Navigation</p>
            <p className="mt-1 text-[14px] font-bold text-black">Menu</p>
          </div>
          {/* <span className="rounded-full border border-black/8 bg-white px-2.5 py-1 text-[10px] font-semibold text-black/38">
            {menuItems.length} Items
          </span> */}
        </div>

        <ul className="space-y-3">
          {menuItems.map((item) => {
            const isActive = activeMenu === item.label
            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => onMenuSelect(item.label)}
                  className={[
                    'flex w-full items-center justify-between gap-3 rounded-[18px] border px-3.5 py-3 text-left transition-all',
                    isActive
                      ? 'border-[#fad933] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(251,208,5,0.16)_100%)] shadow-[0_10px_24px_rgba(250,217,51,0.18)]'
                      : 'border-black/5 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] hover:border-[#fad933]/28 hover:bg-[#fffdf8]',
                  ].join(' ')}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={[
                        'flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full transition-colors',
                        isActive ? 'bg-[#fad933]/22 text-[#b47a16]' : 'bg-black/5 text-black/55',
                      ].join(' ')}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <span
                        className={[
                          'block truncate text-[16px] font-semibold',
                          isActive ? 'text-black' : 'text-black/72',
                        ].join(' ')}
                      >
                        {item.label}
                      </span>
                      <span
                        className={[
                          'mt-0.5 block text-[9px] uppercase tracking-[0.16em]',
                          isActive ? 'text-[#b47a16]' : 'text-black/28',
                        ].join(' ')}
                      >
                        {isActive ? 'Current Section' : 'Open Section'}
                      </span>
                    </div>
                  </div>

                  <ChevronRight
                    className={[
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-[#b47a16]' : 'text-black/28',
                    ].join(' ')}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export function FeedbackToast({ message }: { message: string | null }) {
  if (!message) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 top-[100px] z-999 flex justify-center">
      <div className="rounded-[14px] border border-[#fad933]/25 bg-[linear-gradient(135deg,rgba(30,24,10,0.95),rgba(20,16,8,0.95))] px-5 py-3 text-[14px] font-medium text-white shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(250,217,51,0.08)] backdrop-blur-md">
        {message}
      </div>
    </div>
  )
}

export function WalletSheet({
  copy,
  isOpen,
  walletAddress,
  chainName,
  isBscNetwork,
  onClose,
  onCopyWallet,
  onSwitch,
  onSwitchNetwork,
  onDisconnect,
  isSwitchingNetwork,
}: {
  copy: CopyText
  isOpen: boolean
  walletAddress: string | null
  chainName: string
  isBscNetwork: boolean
  onClose: () => void
  onCopyWallet: () => void
  onSwitch: () => void
  onSwitchNetwork: () => void
  onDisconnect: () => void
  isSwitchingNetwork: boolean
}) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] overflow-hidden rounded-t-[24px] border border-black/5 bg-[#f8f8f5] shadow-[0_-10px_40px_rgba(0,0,0,0.16)] transition-all duration-300 ${
        isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <div className="border-b border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,250,240,0.96)_100%)] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d7ab1e]">Wallet Center</p>
            <span className="mt-1 block text-base font-semibold text-black">{copy.walletTitle}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm font-medium text-black/45 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
          >
            {copy.close}
          </button>
        </div>
      </div>

      <div className="space-y-3 px-5 py-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            <span className="text-[11px] uppercase tracking-[0.15em] text-black/35">Connected</span>
          </div>
          <div className="mt-2 break-all text-[14px] font-medium text-black/75">
            {walletAddress}
          </div>
        </div>

        <div className={`rounded-2xl border px-4 py-3 ${
          isBscNetwork
            ? 'border-emerald-400/20 bg-emerald-400/6'
            : 'border-amber-400/20 bg-[#fff8e8]'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-black/35">{copy.networkCurrent}</p>
              <p className="mt-1 text-[14px] font-medium text-black/75">{chainName}</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                isBscNetwork ? 'bg-emerald-400/15 text-emerald-700' : 'bg-amber-400/15 text-amber-700'
              }`}
            >
              {isBscNetwork ? copy.networkBscName : copy.networkUnsupported}
            </span>
          </div>

          {!isBscNetwork ? (
            <button
              type="button"
              onClick={() => { onSwitchNetwork(); onClose() }}
              className="mt-3 flex w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#ffe566,#fad933,#d4a32a)] py-2.5 text-[13px] font-bold text-[#1a1200] shadow-[0_4px_20px_rgba(250,217,51,0.25)] transition-all active:scale-[0.98]"
            >
              {isSwitchingNetwork ? '...' : copy.networkSwitchAction}
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => { onCopyWallet(); onClose() }}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-black/5 bg-white py-3 text-black/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition hover:bg-[#fffaf0]"
          >
            <svg className="h-5 w-5 text-[#c58b1f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span className="text-[11px] font-medium text-black/55">{copy.walletCopyAction}</span>
          </button>

          <button
            type="button"
            onClick={() => { onSwitch(); onClose() }}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-black/5 bg-white py-3 text-black/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition hover:bg-[#fffaf0]"
          >
            <svg className="h-5 w-5 text-[#c58b1f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            <span className="text-[11px] font-medium text-black/55">{copy.walletSwitch}</span>
          </button>

          <button
            type="button"
            onClick={() => { onDisconnect(); onClose() }}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-red-400/15 bg-red-400/5 py-3 transition hover:bg-red-400/10"
          >
            <svg className="h-5 w-5 text-red-400/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="text-[11px] font-medium text-red-400/70">{copy.walletDisconnect}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function NetworkSheet({
  copy,
  isOpen,
  chainName,
  onClose,
  onSwitchNetwork,
  isSwitching,
}: {
  copy: CopyText
  isOpen: boolean
  chainName: string
  onClose: () => void
  onSwitchNetwork: () => void
  isSwitching: boolean
}) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] overflow-hidden rounded-t-[24px] border border-black/5 bg-[#f8f8f5] shadow-[0_-10px_40px_rgba(0,0,0,0.16)] transition-all duration-300 ${
        isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <div className="border-b border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,250,240,0.96)_100%)] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d7ab1e]">Network Status</p>
            <span className="mt-1 block text-base font-semibold text-black">{copy.networkSwitchTitle}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm font-medium text-black/45 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
          >
            {copy.close}
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <div className="rounded-2xl border border-amber-400/20 bg-[#fff8e8] px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.15em] text-black/35">{copy.networkCurrent}</p>
          <p className="mt-1 text-[14px] font-medium text-black/75">{chainName}</p>
        </div>

        <p className="text-[13px] leading-relaxed text-black/58">
          {copy.networkSwitchDescription}
        </p>

        <button
          type="button"
          onClick={onSwitchNetwork}
          className="flex w-full items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,#ffe566,#fad933,#d4a32a)] py-3 text-[14px] font-bold text-[#1a1200] shadow-[0_4px_20px_rgba(250,217,51,0.25)] transition-all active:scale-[0.98]"
        >
          {isSwitching ? '...' : copy.networkSwitchAction}
        </button>
      </div>
    </div>
  )
}

export function LanguageSheet({
  copy,
  isOpen,
  selectedLanguageCode,
  onClose,
  onSelectLanguage,
}: {
  copy: CopyText
  isOpen: boolean
  selectedLanguageCode: LanguageOption['code']
  onClose: () => void
  onSelectLanguage: (code: LanguageOption['code']) => void
}) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] overflow-hidden rounded-t-[22px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.4)] transition-all duration-300 ${
        isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <div className="flex items-center justify-between border-b border-[#f0f0f3] px-5 py-4">
        <span className="text-sm font-semibold text-[#0d1c3d]">{copy.languageTitle}</span>
        <button type="button" onClick={onClose} className="text-sm font-medium text-[#787f8f]">
          {copy.close}
        </button>
      </div>
      <div className="divide-y divide-[#f0f0f3] pb-[env(safe-area-inset-bottom)]">
        {languageOptions.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelectLanguage(item.code)}
            className="flex h-[54px] w-full items-center gap-3 px-6 transition hover:bg-slate-50"
          >
            <img src={item.flagUrl} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
            <span
              className={`min-w-[90px] text-left ${
                item.code === selectedLanguageCode
                  ? 'text-[16px] font-bold text-[#0d1c3d]'
                  : 'text-[16px] font-bold text-[#787f8f]'
              }`}
            >
              {item.label}
            </span>
            {item.code === selectedLanguageCode ? (
              <span className="shrink-0 rounded-full bg-[#0d1c3d] px-2 py-0.5 text-[10px] font-semibold text-white">
                {copy.activeLabel}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}

export function InviteCodeSheet({
  isOpen,
  defaultCode = '',
  onClose,
  onConfirm,
}: {
  isOpen: boolean
  defaultCode?: string
  onClose: () => void
  onConfirm: (code: string) => void
}) {
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setCode(defaultCode.trim())
  }, [defaultCode, isOpen])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] overflow-hidden rounded-t-[24px] border border-black/5 bg-[#f8f8f5] shadow-[0_-10px_40px_rgba(0,0,0,0.16)] transition-all duration-300 ${
        isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <div className="border-b border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,250,240,0.96)_100%)] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d7ab1e]">Invite Access</p>
            <span className="mt-1 block text-base font-semibold text-black">輸入邀請碼</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/8 bg-white text-black/45 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="px-5 py-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <p className="mb-4 text-[13px] leading-relaxed text-black/58">
          首次登入需要邀請碼，請輸入您的邀請碼以完成註冊
        </p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="請輸入邀請碼"
          className="mb-4 w-full rounded-[14px] border border-black/8 bg-white px-4 py-3 text-[14px] text-black/75 placeholder:text-black/25 outline-none transition focus:border-[#fad933]/45 focus:bg-[#fffdf8] focus:shadow-[0_0_0_4px_rgba(250,217,51,0.12)]"
          autoFocus={isOpen}
        />
        <button
          type="button"
          disabled={!code.trim()}
          onClick={() => { if (code.trim()) onConfirm(code.trim()) }}
          className="flex w-full items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,#ffe566,#fad933,#d4a32a)] py-3 text-[14px] font-bold text-[#1a1200] shadow-[0_4px_20px_rgba(250,217,51,0.25)] transition-all active:scale-[0.98] disabled:opacity-35"
        >
          確認
        </button>
      </div>
    </div>
  )
}
