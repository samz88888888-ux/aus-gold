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
      <div className="rounded-2xl border border-[#fbd005]/20 bg-white/5 p-4">
        <div className="space-y-2">
          {summaryRows.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-white/50">{item.label}</span>
              <span className="font-semibold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {paymentMethods.map((method) => {
          const selected = selectedId === method.id
          const disabled = !method.available && method.type === 1
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedId(method.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selected ? 'border-[#fbd005] bg-[#fbd005]/10' : 'border-white/10 bg-white/5'} ${disabled ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{method.name}</div>
                  <div className="mt-1 text-xs text-white/45">{method.currency}</div>
                  <div className={`mt-2 text-xs ${method.needSwitchChain ? 'text-amber-300' : !method.available && method.type === 1 ? 'text-red-300' : 'text-white/55'}`}>
                    {method.needSwitchChain
                      ? `请切换到 ${method.targetChainName} 网络`
                      : `可用余额: ${Number(method.balance || 0).toFixed(6)}`}
                  </div>
                </div>
                <span className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${selected ? 'border-[#fbd005] bg-[#fbd005] text-black' : 'border-white/20 text-transparent'}`}>
                  ✓
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {selectedMethod?.needSwitchChain && onSwitchChain ? (
        <button
          type="button"
          onClick={() => onSwitchChain(selectedMethod)}
          className="mt-4 w-full rounded-2xl border border-[#fbd005]/40 bg-[#fbd005]/10 py-3 text-sm font-bold text-[#fbd005]"
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
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#fff193] to-[#eba500] py-3 text-sm font-bold text-black disabled:opacity-40"
      >
        确认支付
      </button>
    </BottomPopup>
  )
}
