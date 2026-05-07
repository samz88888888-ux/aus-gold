import { useEffect, useState } from 'react'

import { BottomPopup } from '../BottomPopup'
import type { PaymentMethod } from '../../services/types'
import { useOldPagesCopy } from '../../i18n'

type PreOrderPaymentMethodModalProps = {
  visible: boolean
  title?: string
  orderAmount: number | string
  paymentMethods: PaymentMethod[]
  onClose: () => void
  onConfirm: (method: PaymentMethod) => void
}

export function PreOrderPaymentMethodModal({
  visible,
  title,
  orderAmount,
  paymentMethods,
  onClose,
  onConfirm,
}: PreOrderPaymentMethodModalProps) {
  const copy = useOldPagesCopy()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    if (!visible) {
      setSelectedId(null)
    }
  }, [visible])

  const selectedMethod = paymentMethods.find((item) => item.id === selectedId) ?? null

  return (
    <BottomPopup visible={visible} onClose={onClose} title={title ?? copy.paymentMethod}>
      <div className="rounded-2xl border border-[#fbd005]/20 bg-[#fff7d6]/8 px-4 py-3 text-center">
        <div className="text-xs text-white/50">{copy.orderAmount}</div>
        <div className="mt-1 text-2xl font-black text-[#fbd005]">{Number(orderAmount || 0).toFixed(2)} USDT</div>
      </div>

      <div className="mt-4 space-y-3">
        {paymentMethods.map((method) => {
          const selected = selectedId === method.id
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedId(method.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selected ? 'border-[#fbd005] bg-[#fbd005]/10' : 'border-white/10 bg-white/5'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{method.name}</div>
                  <div className="mt-1 text-xs text-white/45">
                    {method.pay_type === 2 ? copy.mixedPayment : copy.singlePayment}
                  </div>
                </div>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${selected ? 'border-[#fbd005] bg-[#fbd005] text-black' : 'border-white/20 text-transparent'}`}>
                  ✓
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        disabled={!selectedMethod}
        onClick={() => {
          if (!selectedMethod) return
          onConfirm(selectedMethod)
        }}
        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#fff193] to-[#eba500] py-3 text-sm font-bold text-black disabled:opacity-40"
      >
        {copy.confirmPayment}
      </button>
    </BottomPopup>
  )
}
