import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
import { ConfirmPopup } from '../../components/ConfirmPopup'
import { PendingOrderPaymentModal } from '../../components/payment/PendingOrderPaymentModal'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { useChainPayment } from '../../hooks/useChainPayment'
import { cancelPreOrder, fetchPreOrderList, fetchPreOrderPaymentInfo, payPreOrder } from '../../services/api'
import type {
  PreOrderItem,
  PreOrderPaymentInfo,
  PreOrderPaymentItem,
  PreOrderPayResponse,
  ResolvedPendingPaymentMethod,
} from '../../services/types'

function useCountdown(expireAt: string) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expireAt).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining('已过期')
        return
      }

      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
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

function getCurrencyByChainId(chainCurrencyId?: number) {
  const currencyMap: Record<number, string> = {
    1: 'USDT',
    2: 'NADI',
    5: 'MCG',
    6: 'VIC',
    7: 'CW',
    8: 'FBB',
    9: 'KITI',
    10: 'NAAU',
    17: 'VIC',
    18: 'CW',
    19: 'FBB',
    20: 'KITI',
    21: 'NAAU',
  }

  return chainCurrencyId ? currencyMap[chainCurrencyId] ?? 'Unknown' : 'Unknown'
}

function formatOrderTitle(order: PreOrderItem) {
  if (String(order.order_type) === '5' && order.gold_source?.title) return order.gold_source.title
  if (String(order.order_type) === '1' && order.equipment_source?.title) return order.equipment_source.title
  if (String(order.order_type) === '2' && order.node_source?.name) return order.node_source.name
  return order.order_type_text || '待支付订单'
}

type OrderCardProps = {
  order: PreOrderItem
  onCancel: (order: PreOrderItem) => void
  onPay: (order: PreOrderItem, payment: PreOrderPaymentItem) => void
}

function OrderCard({ order, onCancel, onPay }: OrderCardProps) {
  const canAct = order.status === 1 || order.status === 2
  const payments = order.payment ?? []

  return (
    <div className="relative overflow-hidden rounded-[18px] bg-[#1e1e1e] p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <span className="inline-flex max-w-[220px] truncate rounded-xl bg-[#fbd005]/10 px-2.5 py-1 text-sm font-semibold text-[#fbd005]">
            {formatOrderTitle(order)}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{Number(order.total_amount || order.amount || 0).toLocaleString()}</span>
            <span className="text-lg font-bold text-white/90">USDT</span>
          </div>
          <span className="text-xs text-white/50">{order.status_text}</span>
        </div>

        {canAct ? (
          <button
            type="button"
            onClick={() => onCancel(order)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 active:opacity-70"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            取消订单
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        {payments.map((payment) => {
          const disabled = order.status === 3 || order.status === 4 || payment.status === 2 || payment.status === 3
          return (
            <div key={payment.id} className="relative overflow-hidden rounded-2xl bg-white/[0.08] p-4">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {getCurrencyByChainId(payment.system_currency_id)} 丨 {payment.radio_rate ?? '--'}%
                  </div>
                  <div className="mt-1 text-xs text-white/45">${Number(payment.total_amount || 0).toFixed(2)}</div>
                </div>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPay(order, payment)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold ${disabled ? 'bg-white/10 text-white/30' : 'bg-gradient-to-r from-[#fff193] to-[#eba500] text-black'}`}
                >
                  {disabled ? (payment.status === 2 || order.status === 3 ? '已支付' : '已取消') : '去支付'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-white/40">
        <span>{order.order_no}</span>
        <CountdownBadge expireAt={order.expire_at} />
      </div>
      <div className="mt-1 text-[11px] text-white/30">创建: {order.created_at}</div>
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
  const [paymentInfo, setPaymentInfo] = useState<PreOrderPaymentInfo | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<ResolvedPendingPaymentMethod[]>([])
  const [showPaymentPopup, setShowPaymentPopup] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<PreOrderItem | null>(null)
  const [selectedPaymentItem, setSelectedPaymentItem] = useState<PreOrderPaymentItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const loadedRef = useRef(false)
  const {
    checkChainMatch,
    executePendingOrderChainPayment,
    getBalanceForCurrency,
    getTargetChainName,
    isProcessing: chainPaying,
    statusText,
    switchChain,
  } = useChainPayment()

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      setOrders(await fetchPreOrderList())
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取待支付订单失败'
      alert(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    void loadOrders()
  }, [loadOrders])

  const buildPaymentMethods = useCallback(async (info: PreOrderPaymentInfo) => {
    const methods: ResolvedPendingPaymentMethod[] = []
    const totalAmount = Number(info.ac_amount || 0)
    const paymentMethodsType = Number(info.payment_methods || 0)
    const paymentType = info.sub_currency?.contract_address ? 'chain_usdt_spa' : 'chain_usdt'

    if (paymentMethodsType === 1 || paymentMethodsType === 3) {
      methods.push({
        id: 1,
        type: 1,
        system_currency_id: info.system_currency_id,
        name: info.system_currency_id === 2 ? '余额混合支付' : '余额支付',
        currency: getCurrencyByChainId(info.system_currency_id),
        balance: Number(info.systemAmount || 0),
        available: Number(info.systemAmount || 0) >= totalAmount,
        payment: 'system_balance',
      })
    }

    const targetChainId = Number(info.chainCurrency?.chain_id || 0)
    if ((paymentMethodsType === 2 || paymentMethodsType === 3) && (targetChainId === 56 || targetChainId === 399) && info.chainCurrency) {
      const normalizedTargetChainId = targetChainId as 56 | 399
      const matched = await checkChainMatch(normalizedTargetChainId)
      const balance = matched ? await getBalanceForCurrency(info.chainCurrency, normalizedTargetChainId) : 0

      methods.push({
        id: 2,
        type: 2,
        system_currency_id: info.system_currency_id,
        name: '链上支付',
        currency: info.chainCurrency.name || getCurrencyByChainId(info.system_currency_id),
        balance,
        available: matched && balance >= totalAmount,
        payment: normalizedTargetChainId === 399 ? 'chain_nadi' : paymentType,
        isChainMatch: matched,
        targetChainId: normalizedTargetChainId,
        targetChainName: getTargetChainName(normalizedTargetChainId),
        needSwitchChain: !matched,
        chainInfo: info.chainCurrency,
      })
    }

    return methods
  }, [checkChainMatch, getBalanceForCurrency, getTargetChainName])

  const handleOpenPayment = async (order: PreOrderItem, payment: PreOrderPaymentItem) => {
    if (!((order.status === 1 || order.status === 2) && payment.status === 1)) return

    try {
      setSubmitting(true)
      const info = await fetchPreOrderPaymentInfo({
        pre_order_id: order.id,
        pre_order_payment_id: payment.id,
      })

      const nextMethods = await buildPaymentMethods(info)
      setSelectedOrder(order)
      setSelectedPaymentItem(payment)
      setPaymentInfo(info)
      setPaymentMethods(nextMethods)
      setShowPaymentPopup(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取支付信息失败'
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmPay = async (method: ResolvedPendingPaymentMethod) => {
    if (!selectedOrder || !selectedPaymentItem) return

    try {
      setSubmitting(true)
      const result = await payPreOrder({
        pre_order_id: selectedOrder.id,
        pre_order_payment_id: selectedPaymentItem.id,
        payment_methods: method.type,
      })

      if (method.type === 2) {
        await handleChainPayment(result, method)
      }

      setShowPaymentPopup(false)
      setSelectedOrder(null)
      setSelectedPaymentItem(null)
      setPaymentInfo(null)
      setPaymentMethods([])
      await loadOrders()
      alert('支付处理已提交')
    } catch (error) {
      const message = error instanceof Error ? error.message : '支付失败'
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChainPayment = async (result: PreOrderPayResponse, method: ResolvedPendingPaymentMethod) => {
    if (!result.order_no) {
      throw new Error('链上支付缺少订单号')
    }

    await executePendingOrderChainPayment({
      paymentInfo: {
        currency: result.currency ?? paymentInfo?.currency ?? paymentInfo?.chainCurrency ?? null,
        sub_currency: result.sub_currency ?? paymentInfo?.sub_currency ?? null,
      },
      amount: result.amount,
      orderNo: result.order_no,
      paymentType: method.payment,
    })
  }

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return

    try {
      await cancelPreOrder({ pre_order_id: cancelTarget.id })
      setCancelTarget(null)
      await loadOrders()
    } catch (error) {
      const message = error instanceof Error ? error.message : '取消订单失败'
      alert(message)
    }
  }

  const paymentSummary = useMemo(() => ({
    orderAmount: Number(paymentInfo?.ac_amount || 0),
    price: Number(paymentInfo?.price || 0),
    orderValue: Number(paymentInfo?.total_amount || 0),
  }), [paymentInfo])

  return (
    <PageContainer>
      <PageNavBar title="待支付订单" onBack={() => onNavigate('home')} />

      <div className="relative">
        <img src="/old-pages/orders/orders-bg.png" alt="" className="h-44 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a1a]" />
      </div>

      <div className="-mt-12 space-y-5 px-4 pb-10">
        {loading ? (
          <div className="flex flex-col items-center gap-2 py-20">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-amber-400" />
            <span className="text-sm text-white/40">加载中...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-sm text-white/40">暂无待支付订单</div>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} onCancel={setCancelTarget} onPay={handleOpenPayment} />
          ))
        )}
      </div>

      <PendingOrderPaymentModal
        visible={showPaymentPopup}
        orderAmount={paymentSummary.orderAmount}
        price={paymentSummary.price}
        orderValue={paymentSummary.orderValue}
        paymentMethods={paymentMethods}
        onClose={() => {
          if (submitting || chainPaying) return
          setShowPaymentPopup(false)
        }}
        onConfirm={handleConfirmPay}
        onSwitchChain={async (method) => {
          if (!method.targetChainId) return
          try {
            await switchChain(method.targetChainId as 56 | 399)
            if (paymentInfo) {
              setPaymentMethods(await buildPaymentMethods(paymentInfo))
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : '切换网络失败'
            alert(message)
          }
        }}
      />

      <ConfirmPopup
        visible={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        title="取消订单"
        message="确定要取消该订单吗？取消后不可恢复。"
        confirmText="确认取消"
        cancelText="再想想"
      />

      {(submitting || chainPaying) ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-[320px] rounded-2xl border border-white/10 bg-[#121212] px-6 py-5 text-center shadow-2xl">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#fbd005]" />
            <p className="mt-4 text-sm font-semibold text-white">{statusText || '正在处理支付...'}</p>
          </div>
        </div>
      ) : null}
    </PageContainer>
  )
}
