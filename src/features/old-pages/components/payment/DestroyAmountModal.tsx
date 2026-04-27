import { useEffect, useMemo, useState } from 'react'

import { BottomPopup } from '../BottomPopup'

export type DestroyAmountSubmitPayload = {
  amount: number
  tokenAmount: number
  inputType: 'usdt' | 'token'
  paymentType: 'nadi' | 'naau'
}

type DestroyAmountModalProps = {
  visible: boolean
  minAmount: number
  price: number
  naauPrice?: number
  currencyName?: string
  showNaauTab?: boolean
  onClose: () => void
  onSubmit: (payload: DestroyAmountSubmitPayload) => void
}

function formatInputValue(value: number) {
  if (!Number.isFinite(value) || value <= 0) return ''
  return Number(value.toFixed(6)).toString()
}

export function DestroyAmountModal({
  visible,
  minAmount,
  price,
  naauPrice = 0,
  currencyName,
  showNaauTab = false,
  onClose,
  onSubmit,
}: DestroyAmountModalProps) {
  const [activeTab, setActiveTab] = useState<'nadi' | 'naau'>('nadi')
  const [usdtValue, setUsdtValue] = useState('')
  const [tokenValue, setTokenValue] = useState('')
  const [lastInputType, setLastInputType] = useState<'usdt' | 'token'>('usdt')

  const currentPrice = activeTab === 'naau' ? Number(naauPrice || 0) : Number(price || 0)
  const activeCurrency = activeTab === 'naau' ? 'NAAU' : (currencyName || 'NADI')
  const isValid = Number(usdtValue || 0) >= Number(minAmount || 0)

  useEffect(() => {
    if (!visible) {
      setActiveTab('nadi')
      setUsdtValue('')
      setTokenValue('')
      setLastInputType('usdt')
    }
  }, [visible])

  useEffect(() => {
    if (!visible) return

    const timeoutId = window.setTimeout(() => {
      if (!currentPrice || currentPrice <= 0) return

      if (lastInputType === 'usdt') {
        const amount = Number(usdtValue || 0)
        if (!amount || amount <= 0) {
          setTokenValue('')
          return
        }
        setTokenValue(formatInputValue(amount * currentPrice))
        return
      }

      const tokenAmount = Number(tokenValue || 0)
      if (!tokenAmount || tokenAmount <= 0) {
        setUsdtValue('')
        return
      }
      setUsdtValue(formatInputValue(tokenAmount / currentPrice))
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [visible, currentPrice, lastInputType, tokenValue, usdtValue])

  const helperRows = useMemo(() => ([
    { label: '最低销毁数量', value: `${Number(minAmount || 0).toFixed(2)} USDT` },
    { label: '当前价格', value: `1U ≈ ${Number(currentPrice || 0).toFixed(6)} ${activeCurrency}` },
  ]), [activeCurrency, currentPrice, minAmount])

  return (
    <BottomPopup visible={visible} onClose={onClose} title="销毁挖矿">
      {showNaauTab ? (
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
          <TabButton active={activeTab === 'nadi'} label="NADI 支付" onClick={() => setActiveTab('nadi')} />
          <TabButton active={activeTab === 'naau'} label="NAAU 支付" onClick={() => setActiveTab('naau')} />
        </div>
      ) : null}

      <div className="space-y-3">
        <AmountInput
          label="输入销毁金额"
          suffix="USDT"
          value={usdtValue}
          onChange={(value) => {
            setLastInputType('usdt')
            setUsdtValue(value)
          }}
          placeholder="请输入 USDT 数量"
        />
        <AmountInput
          label="需支付数量"
          suffix={activeCurrency}
          value={tokenValue}
          onChange={(value) => {
            setLastInputType('token')
            setTokenValue(value)
          }}
          placeholder="自动换算支付数量"
        />
      </div>

      <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
        {helperRows.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="text-white/50">{item.label}</span>
            <span className="font-semibold text-white">{item.value}</span>
          </div>
        ))}
      </div>

      {!isValid && usdtValue ? (
        <p className="mt-3 text-xs text-red-300">最低销毁数量为 {Number(minAmount || 0).toFixed(2)} USDT</p>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (!isValid) return
          onSubmit({
            amount: Number(usdtValue),
            tokenAmount: Number(tokenValue),
            inputType: lastInputType,
            paymentType: activeTab,
          })
        }}
        disabled={!isValid}
        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#fff193] to-[#eba500] py-3 text-sm font-bold text-black disabled:opacity-40"
      >
        确认销毁
      </button>
    </BottomPopup>
  )
}

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? 'bg-black text-[#fbd005]' : 'text-white/60'}`}
    >
      {label}
    </button>
  )
}

function AmountInput({
  label,
  suffix,
  value,
  onChange,
  placeholder,
}: {
  label: string
  suffix: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-white/5 p-4">
      <span className="mb-2 block text-xs text-white/50">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold text-white outline-none placeholder:text-white/25"
        />
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#fbd005]">{suffix}</span>
      </div>
    </label>
  )
}
