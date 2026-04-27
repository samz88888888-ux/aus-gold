type UnpaidOrderReminderModalProps = {
  visible: boolean
  onClose: () => void
  onGoPayment: () => void
}

export function UnpaidOrderReminderModal({
  visible,
  onClose,
  onGoPayment,
}: UnpaidOrderReminderModalProps) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-5">
      <div className="relative w-full max-w-[350px] overflow-hidden rounded-[24px] border border-[#fbd005]/20 bg-[linear-gradient(135deg,#1a1a1a_0%,#0a0a0a_100%)] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="5" y1="5" x2="15" y2="15" />
            <line x1="15" y1="5" x2="5" y2="15" />
          </svg>
        </button>

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#fbd005]/30 bg-[#fbd005]/10">
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-[#fbd005]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h18" />
            <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
            <path d="M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
            <path d="M9 12h6" />
          </svg>
        </div>

        <div className="mt-5 text-center">
          <h3 className="text-lg font-bold text-white">存在待支付订单</h3>
          <p className="mt-2 text-sm leading-6 text-white/65">检测到你有未完成支付的预订单，可直接前往待支付订单继续支付。</p>
        </div>

        <button
          type="button"
          onClick={onGoPayment}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#fff193] to-[#eba500] py-3 text-sm font-bold text-black"
        >
          去支付
        </button>
      </div>
    </div>
  )
}
