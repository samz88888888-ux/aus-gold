import { useEffect, useMemo, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
import { BottomPopup } from '../../components/BottomPopup'
import { NoticePopup } from '../../components/NoticePopup'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchUserInfoOld } from '../../services/api'
import type { UserInfo } from '../../services/types'

type WithdrawPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

type CurrencyType = 'USDT' | 'USDT(挖矿)'

const COINS: Array<{ key: CurrencyType; label: string }> = [
  { key: 'USDT', label: 'USDT' },
  { key: 'USDT(挖矿)', label: 'USDT(挖矿)' },
]

function fmt(value: number | string | undefined) {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  })
}

export function WithdrawPage({ onNavigate }: WithdrawPageProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('USDT')
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    fetchUserInfoOld().then(setUserInfo).catch(() => {})
  }, [])

  const available = useMemo(() => (
    selectedCurrency === 'USDT'
      ? Number(userInfo?.usdt || 0)
      : Number(userInfo?.usdt_mine || 0)
  ), [selectedCurrency, userInfo?.usdt, userInfo?.usdt_mine])

  return (
    <PageContainer bgClass="bg-[#05060a]">
      <PageNavBar title="提现" onBack={() => onNavigate('wallet')} />

      <div className="px-4 pb-24 pt-3">
        <div className="rounded-2xl border border-white/10 bg-[#17181f] p-4">
          <div className="mb-3">
            <p className="text-[12px] text-white/55">币种</p>
            <button
              type="button"
              onClick={() => setShowCurrencyPicker(true)}
              className="mt-1.5 flex w-full items-center justify-between rounded-xl border border-white/12 bg-white/4 px-3 py-3 text-sm"
            >
              <span className="flex items-center gap-2 text-white">
                <img src="/old-pages/wallet/usdt-coin.png" alt={selectedCurrency} className="h-5 w-5 rounded-full" />
                {selectedCurrency}
              </span>
              <span className="text-xs text-white/50">切换</span>
            </button>
          </div>

          <div className="mb-3">
            <p className="text-[12px] text-white/55">提现地址</p>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="请输入接收地址"
              className="mt-1.5 w-full rounded-xl border border-white/12 bg-white/4 px-3 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#fbd005]/40"
            />
          </div>

          <div>
            <p className="text-[12px] text-white/55">提现数量</p>
            <div className="mt-1.5 rounded-xl border border-white/12 bg-white/4 px-3 py-3">
              <div className="flex items-center gap-2">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="请输入数量"
                  inputMode="decimal"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() => setAmount(String(available))}
                  className="shrink-0 rounded-full border border-[#fbd005]/35 px-2 py-0.5 text-[11px] text-[#fbd005]"
                >
                  全部
                </button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-white/48">可用余额：{fmt(available)} {selectedCurrency}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!address.trim()) {
              setNotice('请输入提现地址')
              return
            }
            if (!amount || Number(amount) <= 0) {
              setNotice('请输入正确的提现数量')
              return
            }
            if (Number(amount) > available) {
              setNotice('提现数量超过可用余额')
              return
            }
            setNotice('敬请期待')
          }}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#fff193] to-[#eba500] py-3.5 text-[15px] font-bold text-black"
        >
          提交提现
        </button>
      </div>

      <BottomPopup visible={showCurrencyPicker} onClose={() => setShowCurrencyPicker(false)} title="选择币种">
        <div className="space-y-2">
          {COINS.map((coin) => {
            const active = coin.key === selectedCurrency
            return (
              <button
                key={coin.key}
                type="button"
                onClick={() => {
                  setSelectedCurrency(coin.key)
                  setShowCurrencyPicker(false)
                }}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left ${active ? 'border-[#fbd005]/60 bg-[#fbd005]/10' : 'border-white/10 bg-white/5'}`}
              >
                <img src="/old-pages/wallet/usdt-coin.png" alt={coin.label} className="h-6 w-6 rounded-full" />
                <span className={`text-sm ${active ? 'text-[#fbd005]' : 'text-white/85'}`}>{coin.label}</span>
              </button>
            )
          })}
        </div>
      </BottomPopup>

      <NoticePopup
        visible={notice !== null}
        message={notice ?? ''}
        onClose={() => setNotice(null)}
      />
    </PageContainer>
  )
}
