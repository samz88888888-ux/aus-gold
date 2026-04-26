import { type ReactNode, useEffect, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
import { PageContainer } from '../../components/PageContainer'
import { fetchDestoryInfo, fetchUserInfoOld } from '../../services/api'
import type { DestoryInfo, UserInfo } from '../../services/types'

function fmt(value: number | string | undefined) {
  if (!value && value !== 0) return '0.00'
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

type MingPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function MingPage({
  onNavigate,
}: MingPageProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [destoryInfo, setDestoryInfo] = useState<DestoryInfo | null>(null)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.allSettled([fetchUserInfoOld(), fetchDestoryInfo()]).then(([userResult, destroyResult]) => {
      if (cancelled) return

      if (userResult.status === 'fulfilled') {
        setUserInfo(userResult.value)
      }

      if (destroyResult.status === 'fulfilled') {
        setDestoryInfo(destroyResult.value)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const totalPower = fmt(userInfo?.valid_user_power)
  const lockedPower = fmt(userInfo?.valid_user_power)

  return (
    <PageContainer bgClass="bg-[#040404]">
      <div className="relative overflow-hidden px-4 pb-12 pt-4 text-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(251,208,5,0.26),rgba(251,208,5,0.05)_42%,transparent_72%)]" />
        <div className="pointer-events-none absolute right-[-60px] top-[110px] h-[220px] w-[220px] rounded-full bg-[#f7b500]/12 blur-[80px]" />
        <div className="pointer-events-none absolute left-[-90px] top-[280px] h-[240px] w-[240px] rounded-full bg-[#266dff]/10 blur-[100px]" />

        <section className="relative overflow-hidden rounded-[30px] border border-[#f7c931]/18 bg-[#080808] shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          <div
            className="absolute inset-0 opacity-80"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(3,3,3,0.94) 10%, rgba(3,3,3,0.72) 48%, rgba(3,3,3,0.28) 100%), url('/old-pages/ming/ming-index-gb.png')",
              backgroundPosition: 'center top',
              backgroundSize: 'cover',
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.55))]" />

          <div className="relative px-5 pb-5 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f6c640]">
                  Mining Center
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <img src="/old-pages/ming/ming-power-light.png" alt="" className="h-4 w-4" />
                  <span className="text-[13px] font-medium text-white/72">累計算力 (T)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('mingLog')}
                className="inline-flex h-9 items-center rounded-full border border-[#f7c931]/25 bg-black/45 px-3.5 text-[11px] font-semibold text-white shadow-[0_8px_18px_rgba(0,0,0,0.28)] backdrop-blur"
              >
                算力日志
              </button>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[42px] font-black leading-none tracking-[-0.04em] text-white">
                  {totalPower}
                </p>
                <div className="mt-4 inline-flex items-center rounded-full bg-[linear-gradient(135deg,#ffec92_0%,#fbd005_55%,#d79712_100%)] px-3.5 py-1.5 shadow-[0_10px_24px_rgba(251,208,5,0.24)]">
                  <span className="text-[12px] font-black tracking-[0.02em] text-[#251600]">
                    鎖倉算力：{lockedPower}
                  </span>
                </div>
              </div>

              <div className="w-[110px] shrink-0 rounded-[22px] border border-white/10 bg-black/35 p-2.5 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Current</p>
                <p className="mt-2 text-[18px] font-black text-[#f8cc45]">
                  {fmt(destoryInfo?.naau_price)}
                </p>
                <p className="mt-1 text-[11px] text-white/55">NAAU 價格</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mt-5 overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,18,18,0.98),rgba(8,8,8,0.98))] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.34)]">
          <div className="absolute left-0 right-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(251,208,5,0.5),transparent)]" />

          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f6c640]">
                Mining Engine
              </p>
              <h2 className="mt-1 text-[22px] font-black text-white">核心算力區</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-white/48">
              Live Preview
            </div>
          </div>

          <div className="overflow-hidden rounded-[26px] border border-[#f7c931]/15 bg-black/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="aspect-[5/4] w-full">
              <img
                src="https://nadiassets-1302761331.cos.ap-hongkong.myqcloud.com/video/ming-new.gif"
                alt="mining preview"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoTile label="最低銷毀" value={`${fmt(destoryInfo?.min_amount)} USDT`} />
            <InfoTile label="當前價格" value={`${fmt(destoryInfo?.price)} USDT`} />
          </div>
        </section>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <ActionButton
            icon={<PlusBadgeIcon />}
            label="我的礦機"
            onClick={() => onNavigate('destoryList')}
          />
          <ActionButton
            icon={<ArrowBadgeIcon />}
            label="銷毀挖礦"
            onClick={() => setShowPopup(true)}
          />
        </div>

        <section className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f6c640]">
            Strategy Note
          </p>
          <p className="mt-2 text-[13px] leading-[22px] text-white/62">
            算力展示、設備入口與銷毀挖礦被整合到同一條視線上，先看總算力，再看核心引擎，最後進入操作，避免原頁面視覺重心分散。
          </p>
        </section>
      </div>

      <DestroySheet
        visible={showPopup}
        destoryInfo={destoryInfo}
        onClose={() => setShowPopup(false)}
      />
    </PageContainer>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-[18px] border border-[#f6c640]/28 bg-[linear-gradient(165deg,rgba(29,29,29,0.98)_0%,rgba(10,10,10,0.98)_100%)] px-3.5 py-3 text-left text-white shadow-[0_16px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] transition-transform active:scale-[0.98]"
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <div className="min-w-0 flex-1">
          <p className="truncate whitespace-nowrap text-[14px] font-bold leading-none text-[#f8cf48]">{label}</p>
        </div>
      </div>
    </button>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{label}</p>
      <p className="mt-2 text-[16px] font-black text-white">{value}</p>
    </div>
  )
}

function PlusBadgeIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f8cf48]/35 bg-[#f8cf48]/12 text-[#f8cf48] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    </span>
  )
}

function ArrowBadgeIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f8cf48]/35 bg-[#f8cf48]/12 text-[#f8cf48] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5" />
        <path d="m6 11 6-6 6 6" />
      </svg>
    </span>
  )
}

function DestroySheet({
  visible,
  destoryInfo,
  onClose,
}: {
  visible: boolean
  destoryInfo: DestoryInfo | null
  onClose: () => void
}) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/72 backdrop-blur-sm"
        onClick={onClose}
        aria-label="关闭"
      />

      <div className="relative w-full max-w-[430px] overflow-hidden rounded-t-[28px] border border-white/10 bg-[#0f0f10] shadow-[0_-20px_50px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(251,208,5,0.6),transparent)]" />

        <div className="flex justify-center pt-3 pb-1">
          <div className="h-[4px] w-10 rounded-full bg-white/16" />
        </div>

        <div className="px-5 pb-8 pt-2 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f6c640]">
                Destroy Mining
              </p>
              <h2 className="mt-1 text-[22px] font-black text-white">銷毀挖礦</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <line x1="5" y1="5" x2="15" y2="15" />
                <line x1="15" y1="5" x2="5" y2="15" />
              </svg>
            </button>
          </div>

          <p className="mt-3 text-[13px] leading-[22px] text-white/58">
            保留当前入口与数据结构，只把信息组织成更清晰的决策面板，优先展示门槛、价格和 NAAU 参考值。
          </p>

          <div className="mt-5 space-y-3">
            <InfoRow label="最低銷毀數量" value={`${fmt(destoryInfo?.min_amount)} USDT`} />
            <InfoRow label="當前價格" value={`${fmt(destoryInfo?.price)} USDT`} />
            <InfoRow label="NAAU 價格" value={`${fmt(destoryInfo?.naau_price)} USDT`} highlight />
          </div>

          <button
            type="button"
            className="mt-5 flex h-[52px] w-full items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#fff2a8_0%,#fbd005_58%,#d8940f_100%)] text-[15px] font-black text-[#140b00] shadow-[0_12px_24px_rgba(251,208,5,0.18)]"
          >
            確認銷毀
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-[16px] border border-white/8 bg-white/[0.04] px-4 py-3">
      <span className="text-[13px] text-white/48">{label}</span>
      <span className={highlight ? 'text-[14px] font-black text-[#f8cf48]' : 'text-[14px] font-semibold text-white/86'}>
        {value}
      </span>
    </div>
  )
}
