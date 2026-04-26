import { useState, useEffect } from 'react'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchUserInfoOld, fetchDestoryInfo } from '../../services/api'
import type { UserInfo, DestoryInfo } from '../../services/types'
import type { AppPage, PageParams } from '../../../figma/types'

function fmt(value: number | string | undefined) {
  if (!value && value !== 0) return '0.00'
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

type MingPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function MingPage({ onNavigate }: MingPageProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [destoryInfo, setDestoryInfo] = useState<DestoryInfo | null>(null)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    fetchUserInfoOld().then(setUserInfo)
    fetchDestoryInfo().then(setDestoryInfo)
  }, [])

  return (
    <PageContainer bgClass="bg-[#07071a]">
      <div className="relative min-h-screen">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251,208,5,0.12) 0%, transparent 70%)' }} />

        <PageNavBar title="算力" onBack={() => onNavigate('home')} />

        <div className="relative px-4 pt-2 pb-8">
          {/* 算力日志入口 */}
          <LogEntryButton onClick={() => onNavigate('mingLog')} />

          {/* 主卡片 */}
          <PowerCard userInfo={userInfo} />

          {/* 数据指标 */}
          <StatsGrid userInfo={userInfo} />

          {/* 操作按钮 */}
          <div className="mt-5 flex gap-3">
            <GoldButton label="我的矿机" onClick={() => onNavigate('destoryList')} />
            <GoldButton label="销毁挖矿" onClick={() => setShowPopup(true)} />
          </div>
        </div>

        {/* 销毁挖矿弹窗 */}
        <DestroySheet
          visible={showPopup}
          destoryInfo={destoryInfo}
          onClose={() => setShowPopup(false)}
        />
      </div>
    </PageContainer>
  )
}

function LogEntryButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="mb-3 ml-auto flex items-center gap-1.5 rounded-full border border-[#fbd005]/20 bg-[#fbd005]/8 px-3.5 py-1.5 transition active:scale-95">
      <span className="text-xs font-medium text-[#fbd005]">算力日志</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbd005" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  )
}

function PowerCard({ userInfo }: { userInfo: UserInfo | null }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-white/[0.06]"
      style={{ background: 'linear-gradient(160deg, #1a1a3e 0%, #0d0d24 50%, #111128 100%)' }}>
      <div className="relative px-5 pb-6 pt-8">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "url('/old-pages/ming/ming-list-bg.png')", backgroundSize: 'cover' }} />
        <div className="relative">
          <p className="text-xs tracking-wider text-white/40">我的算力 (T)</p>
          <p className="mt-2 text-[40px] font-bold leading-none tracking-tight text-white">
            {fmt(userInfo?.valid_user_power)}
          </p>
        </div>
      </div>
    </div>
  )
}

function StatsGrid({ userInfo }: { userInfo: UserInfo | null }) {
  const stats = [
    { label: '直推人数', value: String(userInfo?.zhi_num ?? 0) },
    { label: '团队人数', value: String(userInfo?.team_num ?? 0) },
    { label: '个人业绩', value: fmt(userInfo?.me_performance) },
    { label: '团队业绩', value: fmt(userInfo?.team_performance) },
  ]
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      {stats.map(s => (
        <div key={s.label}
          className="rounded-2xl border border-white/[0.06] px-4 py-4"
          style={{ background: 'linear-gradient(160deg, rgba(251,208,5,0.06) 0%, rgba(17,17,40,0.8) 100%)' }}>
          <p className="text-[11px] tracking-wide text-white/35">{s.label}</p>
          <p className="mt-1.5 text-lg font-semibold text-white">{s.value}</p>
        </div>
      ))}
    </div>
  )
}

function GoldButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex h-[50px] flex-1 items-center justify-center rounded-2xl font-bold text-[#1a1a2e] shadow-[0_8px_20px_rgba(251,208,5,0.2)] transition active:scale-[0.97]"
      style={{ background: 'linear-gradient(135deg, #fff193 0%, #fbd005 50%, #eba500 100%)' }}>
      <span className="text-sm font-bold">{label}</span>
    </button>
  )
}

function DestroySheet({ visible, destoryInfo, onClose }: {
  visible: boolean
  destoryInfo: DestoryInfo | null
  onClose: () => void
}) {
  if (!visible) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="关闭" />
      <div className="relative w-full max-w-[430px] rounded-t-[24px]"
        style={{ backgroundColor: '#fffdf8', animation: 'slideUp 0.3s ease' }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-[4px] w-10 rounded-full bg-black/12" />
        </div>
        <div className="px-5 pb-8 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-black">销毁挖矿</h2>
            <CloseButton onClick={onClose} />
          </div>
          <SheetBody destoryInfo={destoryInfo} />
        </div>
      </div>
    </div>
  )
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-black/8 bg-black/4 text-black/50 transition hover:bg-black/8 hover:text-black">
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <line x1="5" y1="5" x2="15" y2="15" />
        <line x1="15" y1="5" x2="5" y2="15" />
      </svg>
    </button>
  )
}

function SheetBody({ destoryInfo }: { destoryInfo: DestoryInfo | null }) {
  return (
    <div className="mt-4 space-y-3">
      <InfoRow label="最低销毁数量" value={`${destoryInfo?.min_amount ?? '--'} USDT`} />
      <InfoRow label="当前价格" value={`${destoryInfo?.price ?? '--'} USDT`} />
      <InfoRow label="NAAU 价格" value={`${destoryInfo?.naau_price ?? '--'} USDT`} highlight />
      <button type="button"
        className="mt-5 flex h-[50px] w-full items-center justify-center rounded-2xl font-bold text-[#1a1a2e] shadow-[0_8px_20px_rgba(251,208,5,0.2)]"
        style={{ background: 'linear-gradient(135deg, #fff193 0%, #fbd005 50%, #eba500 100%)' }}>
        <span className="text-sm font-bold">确认销毁</span>
      </button>
      <p className="text-center text-[10px] text-black/30">
        确认后将发起链上交易，请确保钱包余额充足
      </p>
    </div>
  )
}

function InfoRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[#fbd005]/15 bg-[#fff7d6]/60 px-4 py-3">
      <span className="text-[13px] text-black/50">{label}</span>
      <span className={`text-[14px] font-semibold ${highlight ? 'text-[#d4a017]' : 'text-black/80'}`}>{value}</span>
    </div>
  )
}
