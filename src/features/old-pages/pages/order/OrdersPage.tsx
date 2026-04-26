import { useState, useEffect, useCallback, useRef } from 'react'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { ConfirmPopup } from '../../components/ConfirmPopup'
import { fetchPreOrderList, cancelPreOrder } from '../../services/api'
import type { PreOrderItem } from '../../services/types'
import type { AppPage, PageParams } from '../../../figma/types'

// --- Countdown hook ---
function useCountdown(expireAt: string) {
  const [remaining, setRemaining] = useState('')
  useEffect(() => {
    const tick = () => {
      const diff = new Date(expireAt).getTime() - Date.now()
      if (diff <= 0) { setRemaining('已过期'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expireAt])
  return remaining
}

function CountdownBadge({ expireAt }: { expireAt: string }) {
  const text = useCountdown(expireAt)
  const expired = text === '已过期'
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${expired ? 'bg-red-900/40 text-red-400' : 'bg-amber-900/30 text-amber-300'}`}>
      {expired ? '已过期' : `剩余 ${text}`}
    </span>
  )
}

// --- OrderCard ---
function OrderCard({
  order,
  onCancel,
  onPay,
}: {
  order: PreOrderItem
  onCancel: (o: PreOrderItem) => void
  onPay: (o: PreOrderItem) => void
}) {
  const canAct = order.status === 1 || order.status === 2
  return (
    <div className="relative overflow-hidden rounded-[14px] bg-[#1e1e1e] p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      {/* header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <span className="inline-flex max-w-[200px] truncate rounded-xl bg-[#fbd005]/10 px-2.5 py-1 text-sm font-semibold text-[#fbd005]">
            {order.order_type_text}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{Number(order.amount).toLocaleString()}</span>
            <span className="text-lg font-bold text-white/90">USDT</span>
          </div>
          <span className="text-xs text-white/50">{order.status_text}</span>
        </div>

        {canAct && (
          <button type="button" onClick={() => onCancel(order)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 active:opacity-70">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            取消订单
          </button>
        )}
      </div>

      {/* payment methods */}
      {order.payment_methods?.length > 0 && (
        <div className="flex flex-col gap-3">
          {order.payment_methods.map((pm) => (
            <div key={pm.id} className="relative flex items-center justify-between overflow-hidden rounded-2xl bg-white/[0.08] p-4">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="flex items-center gap-2">
                {pm.icon && <img src={pm.icon} alt="" className="h-7 w-7 rounded-full border-2 border-white/20 object-cover shadow" />}
                <span className="text-sm text-white/80">{pm.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* meta row */}
      <div className="mt-3 flex items-center justify-between text-xs text-white/40">
        <span>{order.order_no}</span>
        <CountdownBadge expireAt={order.expire_at} />
      </div>
      <div className="mt-1 text-[11px] text-white/30">创建: {order.created_at}</div>

      {/* pay button */}
      {canAct && (
        <button type="button" onClick={() => onPay(order)}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#fff193] to-[#eba500] py-3 text-sm font-bold text-black shadow-lg shadow-amber-500/20 active:opacity-80">
          去支付
        </button>
      )}
    </div>
  )
}

type OrdersPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function OrdersPage({ onNavigate }: OrdersPageProps) {
  const [orders, setOrders] = useState<PreOrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState<PreOrderItem | null>(null)
  const loadedRef = useRef(false)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try { setOrders(await fetchPreOrderList()) }
    catch { /* empty */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    loadOrders()
  }, [loadOrders])

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return
    await cancelPreOrder({ pre_order_id: cancelTarget.id })
    setCancelTarget(null)
    loadOrders()
  }

  return (
    <PageContainer>
      <PageNavBar title="待支付订单" onBack={() => onNavigate('home')} />

      {/* hero bg */}
      <div className="relative">
        <img src="/old-pages/orders/orders-bg.png" alt="" className="h-44 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a1a]" />
      </div>

      {/* order list */}
      <div className="-mt-12 space-y-5 px-4 pb-10">
        {loading ? (
          <div className="flex flex-col items-center gap-2 py-20">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-amber-400" />
            <span className="text-sm text-white/40">加载中...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-sm text-white/40">暂无待支付订单</div>
        ) : (
          orders.map((o) => (
            <OrderCard key={o.id} order={o} onCancel={setCancelTarget} onPay={() => alert('支付功能开发中')} />
          ))
        )}
      </div>

      <ConfirmPopup
        visible={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        title="取消订单"
        message="确定要取消该订单吗？取消后不可恢复。"
        confirmText="确认取消"
        cancelText="再想想"
      />
    </PageContainer>
  )
}
