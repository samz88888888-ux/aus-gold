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
      className="mb-6 flex w-full items-center gap-2.5 overflow-hidden rounded-[14px] border border-[#fad933]/15 bg-[linear-gradient(135deg,_rgba(250,217,51,0.08),_rgba(200,146,42,0.04))] px-3 py-2.5 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition hover:border-[#fad933]/25"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fad933]/15">
        <svg className="h-4 w-4 text-[#fad933]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
      <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-white/75">{title}</p>
      <svg className="h-4 w-4 shrink-0 text-white/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] overflow-hidden rounded-t-[22px] bg-[#151515] shadow-[0_-8px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ${
        isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
      style={{ maxHeight: '80vh' }}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fad933]/15">
            <svg className="h-4 w-4 text-[#fad933]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <span className="truncate text-[15px] font-bold text-white">{notice?.title ?? ''}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/60 transition hover:bg-white/20"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="overflow-y-auto overscroll-contain px-5 py-5 pb-[calc(24px+env(safe-area-inset-bottom))]" style={{ maxHeight: 'calc(80vh - 64px)' }}>
        <p className="whitespace-pre-line text-[13px] leading-[22px] text-white/60">
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
}: {
  copy: CopyText
  currentLanguage: LanguageOption
  walletButtonLabel: string
  onMenuToggle: () => void
  onLanguageToggle: () => void
  onWalletConnect: () => void
}) {
  return (
    <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="absolute -inset-[3px] rounded-full bg-[linear-gradient(135deg,_#fad933_0%,_#c8922a_50%,_#fad933_100%)] opacity-60 blur-[3px]" />
          <img src={brandLogoUrl} alt="logo" className="relative h-9 w-9 rounded-full object-cover ring-[1.5px] ring-[#fad933]/40" />
        </div>
        <div className="flex flex-col">
          <span className="bg-[linear-gradient(90deg,_#ffe88a,_#f2bf3e)] bg-clip-text text-[15px] font-extrabold leading-tight tracking-wide text-transparent">
            MCG
          </span>
          <span className="text-[8px] font-medium uppercase tracking-[0.15em] text-white/30">
            Digital Gold
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onWalletConnect}
          className="relative z-30 h-9 rounded-full border border-[#b48d16] bg-[linear-gradient(180deg,_rgba(4,11,13,0.92),_rgba(3,8,8,0.92))] px-3.5 text-[12px] font-semibold text-[#fce596] shadow-[0_3px_6px_rgba(0,0,0,0.28)]"
        >
          {walletButtonLabel}
        </button>

        <button
          type="button"
          onClick={onLanguageToggle}
          className="relative z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-black/70 p-[2px]"
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
          className="relative z-30 flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-white"
          aria-label="打開選單"
        >
          <div className="flex flex-col gap-[4px]">
            <span className="h-[2.5px] w-[22px] rounded-full bg-white" />
            <span className="h-[2.5px] w-[22px] rounded-full bg-white" />
            <span className="h-[2.5px] w-[22px] rounded-full bg-white" />
          </div>
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
      className={`absolute inset-y-0 left-0 z-30 w-[72%] max-w-[292px] bg-[#1d1d1c] shadow-[0_18px_45px_rgba(0,0,0,0.45)] transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="border-b border-white/10 px-4 pb-5 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute -inset-[3px] rounded-full bg-[linear-gradient(135deg,_#fad933_0%,_#c8922a_50%,_#fad933_100%)] opacity-50 blur-[3px]" />
              <img src={brandLogoUrl} alt="logo" className="relative h-10 w-10 rounded-full object-cover ring-[1.5px] ring-[#fad933]/40" />
            </div>
            <div className="flex flex-col">
              <span className="bg-[linear-gradient(90deg,_#ffe88a,_#f2bf3e)] bg-clip-text text-[18px] font-extrabold leading-tight tracking-wide text-transparent">
                MCG
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-white/35">
                Digital Gold
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/70 backdrop-blur transition hover:bg-white/20"
            aria-label={copy.menuClose}
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        {walletAddress ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              <span className="text-[13px] font-medium text-white/60">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onWalletSwitch}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] py-2 transition hover:bg-white/[0.1]"
              >
                <svg className="h-3.5 w-3.5 text-[#fad933]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
                <span className="text-[11px] font-medium text-white/60">{copy.walletSwitch}</span>
              </button>
              <button
                type="button"
                onClick={onWalletDisconnect}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-400/15 bg-red-400/[0.06] py-2 transition hover:bg-red-400/[0.12]"
              >
                <svg className="h-3.5 w-3.5 text-red-400/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="text-[11px] font-medium text-red-400/70">{copy.walletDisconnect}</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onWalletConnect}
            className="mt-3 flex w-full items-center gap-2 rounded-lg border border-[#fad933]/20 bg-[#fad933]/[0.06] px-3 py-2 transition hover:bg-[#fad933]/[0.12]"
          >
            <span className="h-2 w-2 rounded-full bg-[#fad933]/40" />
            <span className="text-[13px] font-medium text-[#fad933]/70">{copy.walletConnectAction}</span>
          </button>
        )}
      </div>

      <nav className="px-4 py-7">
        <ul className="space-y-8">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => onMenuSelect(item.label)}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-[34px] w-[34px] items-center justify-center rounded-full ${
                      activeMenu === item.label ? 'bg-[#4d3f14] text-[#ffd54a]' : 'bg-[#3a3219] text-[#ecbd10]'
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                  </span>
                  <span
                    className={`text-[18px] font-medium ${
                      activeMenu === item.label ? 'text-[#f8e08b]' : 'text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                <ChevronRight
                  className={`h-4 w-4 ${activeMenu === item.label ? 'text-[#f8e08b]' : 'text-white'}`}
                />
              </button>
            </li>
          ))}
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
    <div className="pointer-events-none fixed inset-x-4 top-[100px] z-[999] flex justify-center">
      <div className="rounded-[14px] border border-[#fad933]/25 bg-[linear-gradient(135deg,_rgba(30,24,10,0.95),_rgba(20,16,8,0.95))] px-5 py-3 text-[14px] font-medium text-white shadow-[0_12px_40px_rgba(0,0,0,0.5),_0_0_20px_rgba(250,217,51,0.08)] backdrop-blur-md">
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
      className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] overflow-hidden rounded-t-[22px] bg-[#111111] shadow-[0_-8px_40px_rgba(0,0,0,0.4)] transition-all duration-300 ${
        isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-white">{copy.walletTitle}</span>
          <button type="button" onClick={onClose} className="text-sm font-medium text-white/60">
            {copy.close}
          </button>
        </div>
      </div>

      <div className="space-y-3 px-5 py-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            <span className="text-[11px] uppercase tracking-[0.15em] text-white/40">Connected</span>
          </div>
          <div className="mt-2 break-all text-[14px] font-medium text-white">
            {walletAddress}
          </div>
        </div>

        <div className={`rounded-2xl border px-4 py-3 ${
          isBscNetwork
            ? 'border-emerald-400/20 bg-emerald-400/[0.06]'
            : 'border-amber-400/20 bg-amber-400/[0.06]'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-white/40">{copy.networkCurrent}</p>
              <p className="mt-1 text-[14px] font-medium text-white">{chainName}</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                isBscNetwork ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'
              }`}
            >
              {isBscNetwork ? copy.networkBscName : copy.networkUnsupported}
            </span>
          </div>

          {!isBscNetwork ? (
            <button
              type="button"
              onClick={() => { onSwitchNetwork(); onClose() }}
              className="mt-3 flex w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,_#ffe566,_#fad933,_#d4a32a)] py-2.5 text-[13px] font-bold text-[#1a1200] shadow-[0_4px_20px_rgba(250,217,51,0.25)] transition-all active:scale-[0.98]"
            >
              {isSwitchingNetwork ? '...' : copy.networkSwitchAction}
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => { onCopyWallet(); onClose() }}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-3 transition hover:bg-white/[0.08]"
          >
            <svg className="h-5 w-5 text-[#fad933]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span className="text-[11px] font-medium text-white/55">{copy.walletCopyAction}</span>
          </button>

          <button
            type="button"
            onClick={() => { onSwitch(); onClose() }}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-3 transition hover:bg-white/[0.08]"
          >
            <svg className="h-5 w-5 text-[#fad933]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            <span className="text-[11px] font-medium text-white/55">{copy.walletSwitch}</span>
          </button>

          <button
            type="button"
            onClick={() => { onDisconnect(); onClose() }}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-red-400/15 bg-red-400/[0.05] py-3 transition hover:bg-red-400/[0.1]"
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
      className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] overflow-hidden rounded-t-[22px] bg-[#111111] shadow-[0_-8px_40px_rgba(0,0,0,0.4)] transition-all duration-300 ${
        isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-white">{copy.networkSwitchTitle}</span>
          <button type="button" onClick={onClose} className="text-sm font-medium text-white/60">
            {copy.close}
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.15em] text-white/40">{copy.networkCurrent}</p>
          <p className="mt-1 text-[14px] font-medium text-white">{chainName}</p>
        </div>

        <p className="text-[13px] leading-relaxed text-white/65">
          {copy.networkSwitchDescription}
        </p>

        <button
          type="button"
          onClick={onSwitchNetwork}
          className="flex w-full items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,_#ffe566,_#fad933,_#d4a32a)] py-3 text-[14px] font-bold text-[#1a1200] shadow-[0_4px_20px_rgba(250,217,51,0.25)] transition-all active:scale-[0.98]"
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
  onClose,
  onConfirm,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: (code: string) => void
}) {
  const [code, setCode] = useState('')

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] overflow-hidden rounded-t-[22px] bg-[#111111] shadow-[0_-8px_40px_rgba(0,0,0,0.4)] transition-all duration-300 ${
        isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-white">輸入邀請碼</span>
          <button type="button" onClick={onClose} className="text-sm font-medium text-white/60">✕</button>
        </div>
      </div>

      <div className="px-5 py-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <p className="mb-4 text-[13px] leading-relaxed text-white/45">
          首次登入需要邀請碼，請輸入您的邀請碼以完成註冊
        </p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="請輸入邀請碼"
          className="mb-4 w-full rounded-[12px] border border-white/10 bg-white/[0.05] px-4 py-3 text-[14px] text-white placeholder-white/25 outline-none transition focus:border-[#fad933]/40 focus:bg-white/[0.07]"
          autoFocus={isOpen}
        />
        <button
          type="button"
          disabled={!code.trim()}
          onClick={() => { if (code.trim()) onConfirm(code.trim()) }}
          className="flex w-full items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,_#ffe566,_#fad933,_#d4a32a)] py-3 text-[14px] font-bold text-[#1a1200] shadow-[0_4px_20px_rgba(250,217,51,0.25)] transition-all active:scale-[0.98] disabled:opacity-35"
        >
          確認
        </button>
      </div>
    </div>
  )
}
