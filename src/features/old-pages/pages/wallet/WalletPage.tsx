import { useEffect, useMemo, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
import { NoticePopup } from '../../components/NoticePopup'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { useOldPagesCopy } from '../../i18n'
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

const TOKEN_ICON = '/old-pages/wallet/usdc-coin.png'
const AUS_TOKEN_ICON = '/old-pages/wallet/aus-coin.png'
const BRIDGE_URL = 'https://bridge.pychain.co/bridge'
const SWAP_URL = 'http://swap.pychain.co'

export function WalletPage({ onNavigate }: WalletPageProps) {
  const copy = useOldPagesCopy()
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
      <PageNavBar title={copy.walletPageTitle} onBack={() => onNavigate('home')} />

      <div
        className="min-h-[calc(100vh-48px)] bg-top bg-no-repeat px-4 pb-24 pt-3"
        style={{
          backgroundImage: `url(${walletBackground})`,
          backgroundSize: '100% 100%',
        }}
      >
        <section
          className="relative overflow-hidden rounded-2xl px-4 pb-5 pt-4"
          style={{
            backgroundImage: `url(${fundBackground})`,
            backgroundSize: '100% 100%',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] text-[#112342]">{copy.myAssets}</p>
              <div className="mt-1.5 flex items-end gap-1">
                <span className="text-[24px] font-bold text-[#10223f]">$</span>
                <span className="text-[30px] font-extrabold leading-none text-[#10223f]">
                  {fmtUsd(totalAssets)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('recharge')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#10223f] px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_10px_24px_rgba(16,34,63,0.24)] transition duration-200 active:scale-[0.98]"
            >
              <span className="text-[15px] leading-none">+</span>
              <span>{copy.recharge}</span>
            </button>
          </div>
          <div className="mt-3 inline-flex items-center rounded-full bg-[#0d1f3c]/10 px-3 py-1 text-[11px] text-[#10223f]">
            {copy.account} {shortAddress(address)}
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
            <img
              src={rechargeIcon}
              alt={copy.bridge}
              className="h-9 w-9 object-contain"
            />
            <span className="text-xs text-white/90">{copy.bridge}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('withdraw')}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-[#1b1c25] px-2 py-3 active:opacity-80"
          >
            <img
              src={withdrawIcon}
              alt={copy.withdraw}
              className="h-9 w-9 object-contain"
            />
            <span className="text-xs text-white/90">{copy.withdraw}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = SWAP_URL
            }}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-[#1b1c25] px-2 py-3 active:opacity-80"
          >
            <img
              src={transferIcon}
              alt={copy.swap}
              className="h-9 w-9 object-contain"
            />
            <span className="text-xs text-white/90">{copy.swap}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('moneyLog')}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-[#1b1c25] px-2 py-3 active:opacity-80"
          >
            <img
              src={moneyLogIcon}
              alt={copy.moneyLog}
              className="h-9 w-9 object-contain"
            />
            <span className="text-xs text-white/90">{copy.moneyLog}</span>
          </button>
        </section>

        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white/78">{copy.myTokens}</h2>
            {loading ? (
              <span className="text-xs text-white/45">{copy.loading}</span>
            ) : null}
          </div>
          <div className="space-y-3">
            <TokenRow name="USDC" amount={fmt(usdt)} />
            <TokenRow name={copy.equityPowerValue} amount={fmt(usdtMine)} icon={AUS_TOKEN_ICON} />
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

function TokenRow({
  name,
  amount,
  icon = TOKEN_ICON,
}: {
  name: string
  amount: string
  icon?: string
}) {
  const copy = useOldPagesCopy()
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#1e1e1e] px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <img src={icon} alt={name} className="h-7 w-7 object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-white">{name}</span>
          <span className="text-[11px] text-white/55">{copy.currentBalance}</span>
        </div>
      </div>
      <span className="text-[14px] font-bold text-white">{amount}</span>
    </div>
  )
}
