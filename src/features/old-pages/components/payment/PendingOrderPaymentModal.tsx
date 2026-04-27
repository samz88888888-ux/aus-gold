import { useEffect, useMemo, useState } from 'react'

import { BottomPopup } from '../BottomPopup'
import type { ResolvedPendingPaymentMethod } from '../../services/types'

type PendingOrderPaymentModalProps = {
  visible: boolean
  orderAmount: number | string
  price: number | string
  orderValue: number | string
  paymentMethods: ResolvedPendingPaymentMethod[]
  onClose: () => void
  onConfirm: (method: ResolvedPendingPaymentMethod) => void
  onSwitchChain?: (method: ResolvedPendingPaymentMethod) => void
}

export function PendingOrderPaymentModal({
  visible,
  orderAmount,
  price,
  orderValue,
  paymentMethods,
  onClose,
  onConfirm,
  onSwitchChain,
}: PendingOrderPaymentModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    if (!visible) setSelectedId(null)
  }, [visible])

  const selectedMethod = paymentMethods.find((item) => item.id === selectedId) ?? null
  const canConfirm = Boolean(selectedMethod && !selectedMethod.needSwitchChain && (selectedMethod.available || selectedMethod.type === 2))

  const summaryRows = useMemo(() => ([
    { label: '支付总额', value: `${Number(orderValue || 0).toFixed(2)} USDT` },
    { label: '单价', value: `${Number(price || 0).toFixed(6)}` },
    { label: '需支付', value: `${Number(orderAmount || 0).toFixed(6)}` },
  ]), [orderAmount, orderValue, price])

  return (
    <BottomPopup visible={visible} onClose={onClose} title="待支付订单">
      <div className="rounded-[22px] border border-[#fbd005]/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] p-4 shadow-[0_14px_28px_rgba(0,0,0,0.2)]">
        <div className="mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ffe08a]">Payment Summary</p>
          {/* <p className="mt-1.5 text-[13px] leading-5 text-white/60">系统会按接口返回的支付方式自动匹配可用支付通道。</p> */}
        </div>

        <div className="space-y-1.5">
          {summaryRows.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl bg-black/18 px-3 py-2.5 text-sm">
              <span className="text-white/48">{item.label}</span>
              <span className="font-semibold text-white/95">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {paymentMethods.map((method) => {
          const selected = selectedId === method.id
          const disabled = !method.available && method.type === 1
          const badgeText = method.type === 1 ? '系统余额' : '链上支付'
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedId(method.id)}
              className={`w-full rounded-[20px] border px-4 py-3.5 text-left transition ${selected ? 'border-[#fbd005]/65 bg-[#fbd005]/10 shadow-[0_12px_24px_rgba(251,208,5,0.1)]' : 'border-white/10 bg-white/5'} ${disabled ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fbd005]/12">
                    <img src={method.icon || '/old-pages/wallet/coin-img.png'} alt={method.currency} className="h-8 w-8 object-contain" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <div className="text-[15px] font-semibold text-white">{method.name}</div>
                      <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-medium text-white/58">{badgeText}</span>
                      {method.targetChainName ? (
                        <span className="rounded-full bg-sky-400/10 px-2 py-0.5 text-[10px] font-medium text-sky-200">{method.targetChainName}</span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-[12px] text-white/45">{method.currency}</div>
                    <div className={`mt-1.5 text-[12px] leading-5 ${method.needSwitchChain ? 'text-amber-300' : !method.available && method.type === 1 ? 'text-red-300' : 'text-white/58'}`}>
                      {method.needSwitchChain
                        ? `当前钱包网络不匹配，请切换到 ${method.targetChainName}`
                        : !method.available && method.type === 1
                          ? `余额不足，当前可用 ${Number(method.balance || 0).toFixed(6)}`
                          : `可用余额: ${Number(method.balance || 0).toFixed(6)}`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${selected ? 'border-[#fbd005] bg-[#fbd005] text-black' : 'border-white/20 text-transparent'}`}>
                    ✓
                  </span>
                  <div className="mt-3 text-[10px] text-white/45 whitespace-nowrap">
                    {method.needSwitchChain ? '需切链' : method.available || method.type === 2 ? '可支付' : '余额不足'}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selectedMethod ? (
        <div className="mt-4 rounded-[18px] border border-white/8 bg-black/18 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[14px] font-semibold text-white">{selectedMethod.name}</div>
              <div className="mt-1 text-[12px] leading-5 text-white/45">
                {selectedMethod.type === 1
                  ? '服务端完成系统余额扣款。'
                  : selectedMethod.needSwitchChain
                    ? `需要先切换到 ${selectedMethod.targetChainName} 网络。`
                    : '确认后将拉起钱包完成链上支付。'}
              </div>
            </div>
            <span className="rounded-full bg-white/8 px-3 py-1 text-[10px] font-medium text-white/56">
              {selectedMethod.currency}
            </span>
          </div>
        </div>
      ) : null}

      {selectedMethod?.needSwitchChain && onSwitchChain ? (
        <button
          type="button"
          onClick={() => onSwitchChain(selectedMethod)}
          className="mt-4 w-full rounded-2xl border border-[#fbd005]/40 bg-[#fbd005]/10 py-3 text-[13px] font-bold text-[#fbd005]"
        >
          切换到 {selectedMethod.targetChainName}
        </button>
      ) : null}

      <button
        type="button"
        disabled={!canConfirm}
        onClick={() => {
          if (!selectedMethod || !canConfirm) return
          onConfirm(selectedMethod)
        }}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#fff193] to-[#eba500] py-3.5 text-[16px] font-bold text-black shadow-[0_14px_24px_rgba(235,165,0,0.22)] disabled:opacity-40"
      >
        确认支付
      </button>
    </BottomPopup>
  )
}
