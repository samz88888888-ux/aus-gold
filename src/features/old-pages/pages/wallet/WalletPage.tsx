import { useEffect, useMemo, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
import { NoticePopup } from '../../components/NoticePopup'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchUserInfoOld } from '../../services/api'
import type { UserInfo } from '../../services/types'

import walletBackground from '../../../../assets/wallet/wallet-bg-index.png'
import fundBackground from '../../../../assets/wallet/wallet-bg.png'
import rechargeIcon from '../../../../assets/wallet/recharge.svg'
import withdrawIcon from '../../../../assets/wallet/withdraw.svg'
import transferIcon from '../../../../assets/wallet/draw.svg'
import moneyLogIcon from '../../../../assets/wallet/income.svg'

type WalletPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

function fmt(value: number | string | undefined, digits = 6) {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function fmtUsd(value: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function shortAddress(addr: string) {
  if (!addr) return '--'
  if (addr.length <= 14) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`
}

const TOKEN_ICON = '/old-pages/wallet/usdt-coin.png'
const BRIDGE_URL = 'https://bridge.pychain.co/bridge'

export function WalletPage({ onNavigate }: WalletPageProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchUserInfoOld()
      .then((res) => {
        if (cancelled) return
        setUserInfo(res)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const usdt = Number(userInfo?.usdt || 0)
  const usdtMine = Number(userInfo?.usdt_mine || 0)
  const totalAssets = useMemo(() => usdt + usdtMine, [usdt, usdtMine])
  const address = userInfo?.address || userInfo?.wallet_address || userInfo?.name || ''

  return (
    <PageContainer bgClass="bg-[#05060a]">
      <PageNavBar title="钱包" onBack={() => onNavigate('home')} />

      <div
        className="min-h-[calc(100vh-48px)] bg-top bg-no-repeat px-4 pb-24 pt-3"
        style={{ backgroundImage: `url(${walletBackground})`, backgroundSize: '100% 100%' }}
      >
        <section
          className="relative overflow-hidden rounded-2xl px-4 pb-5 pt-4"
          style={{ backgroundImage: `url(${fundBackground})`, backgroundSize: '100% 100%' }}
        >
          <p className="text-[14px] text-[#112342]">我的资产</p>
          <div className="mt-1.5 flex items-end gap-1">
            <span className="text-[24px] font-bold text-[#10223f]">$</span>
            <span className="text-[30px] font-extrabold leading-none text-[#10223f]">{fmtUsd(totalAssets)}</span>
          </div>
          <div className="mt-3 inline-flex items-center rounded-full bg-[#0d1f3c]/10 px-3 py-1 text-[11px] text-[#10223f]">
            账户 {shortAddress(address)}
          </div>
        </section>

        <section className="mt-4 grid grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => {
              window.location.href = BRIDGE_URL
            }}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-[#1b1c25] px-2 py-3 active:opacity-80"
          >
            <img src={rechargeIcon} alt="跨链桥" className="h-9 w-9 object-contain" />
            <span className="text-xs text-white/90">跨链桥</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('withdraw')}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-[#1b1c25] px-2 py-3 active:opacity-80"
          >
            <img src={withdrawIcon} alt="提现" className="h-9 w-9 object-contain" />
            <span className="text-xs text-white/90">提现</span>
          </button>
          <button
            type="button"
            onClick={() => setNotice('敬请期待')}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-[#1b1c25] px-2 py-3 active:opacity-80"
          >
            <img src={transferIcon} alt="划转" className="h-9 w-9 object-contain" />
            <span className="text-xs text-white/90">划转</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('moneyLog')}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-[#1b1c25] px-2 py-3 active:opacity-80"
          >
            <img src={moneyLogIcon} alt="资金记录" className="h-9 w-9 object-contain" />
            <span className="text-xs text-white/90">资金记录</span>
          </button>
        </section>

        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white/78">我的代币</h2>
            {loading ? <span className="text-xs text-white/45">加载中...</span> : null}
          </div>
          <div className="space-y-3">
            <TokenRow name="USDT" amount={fmt(usdt)} />
            <TokenRow name="USDT(挖矿)" amount={fmt(usdtMine)} />
          </div>
        </section>
      </div>

      <NoticePopup
        visible={notice !== null}
        message={notice ?? ''}
        onClose={() => setNotice(null)}
      />
    </PageContainer>
  )
}

function TokenRow({ name, amount }: { name: string; amount: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#1e1e1e] px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <img src={TOKEN_ICON} alt={name} className="h-7 w-7 object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-white">{name}</span>
          <span className="text-[11px] text-white/55">当前余额</span>
        </div>
      </div>
      <span className="text-[14px] font-bold text-white">{amount}</span>
    </div>
  )
}
