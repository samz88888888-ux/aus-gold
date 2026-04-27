import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
import { ConfirmPopup } from '../../components/ConfirmPopup'
import { NoticePopup } from '../../components/NoticePopup'
import { PendingOrderPaymentModal } from '../../components/payment/PendingOrderPaymentModal'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { useChainPayment } from '../../hooks/useChainPayment'
import type { SupportedChainId } from '../../services/evm'
import { cancelPreOrder, fetchPreOrderList, fetchPreOrderPaymentInfo, payPreOrder } from '../../services/api'
import type {
  PreOrderItem,
  PreOrderPaymentInfo,
  PreOrderPaymentItem,
  PreOrderPayResponse,
  ResolvedPendingPaymentMethod,
} from '../../services/types'

function formatAmount(value: number | string | undefined, digits = 2) {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function getCurrencyByChainId(chainCurrencyId?: number) {
  const currencyMap: Record<number, string> = {
    1: 'USDT',
    2: 'PYTHIA',
    3: 'MCG',
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

function getCurrencyIconById(chainCurrencyId?: number) {
  const iconMap: Record<number, string> = {
    1: '/old-pages/wallet/usdt-coin.png',
    2: '/old-pages/wallet/pyt-coin.png',
    3: '/old-pages/wallet/mcg-coin.png',
    5: '/old-pages/wallet/mcg-coin.png',
    6: '/old-pages/wallet/vic-coin.png',
    7: '/old-pages/wallet/cw-coin.png',
    8: '/old-pages/wallet/fbb-coin.png',
    9: '/old-pages/wallet/kiti-coin.png',
    10: '/old-pages/wallet/naau-coin.png',
    17: '/old-pages/wallet/vic-coin.png',
    18: '/old-pages/wallet/cw-coin.png',
    19: '/old-pages/wallet/fbb-coin.png',
    20: '/old-pages/wallet/kiti-coin.png',
    21: '/old-pages/wallet/naau-coin.png',
  }

  return chainCurrencyId ? iconMap[chainCurrencyId] ?? '/old-pages/wallet/coin-img.png' : '/old-pages/wallet/coin-img.png'
}

function getOrderBusinessType(order: PreOrderItem) {
  const type = String(order.order_type)
  if (type === '5') return '商城购物'
  if (type === '3' || type === 'destroy_machine') return '销毁挖矿'
  if (type === '1') return '矿机订单'
  if (type === '2') return '节点订单'
  if (type === '4') return '联合订单'
  return order.order_type_text || '待支付订单'
}

function getPaymentStateLabel(order: PreOrderItem, payment: PreOrderPaymentItem) {
  if (payment.status === 2 || order.status === 3) return '已支付'
  if (payment.status === 3 || order.status === 4) return '已取消'
  return '待支付'
}

function getPaymentStateClass(order: PreOrderItem, payment: PreOrderPaymentItem) {
  const label = getPaymentStateLabel(order, payment)
  if (label === '已支付') return 'bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-300/15'
  if (label === '已取消') return 'bg-white/8 text-white/45 ring-1 ring-white/10'
  return 'bg-sky-400/12 text-sky-200 ring-1 ring-sky-300/15'
}

type OrderCardProps = {
  order: PreOrderItem
  onCancel: (order: PreOrderItem) => void
  onPay: (order: PreOrderItem, payment: PreOrderPaymentItem) => void
}

function OrderCard({ order, onCancel, onPay }: OrderCardProps) {
  const canAct = order.status === 1 || order.status === 2
  const payments = order.payment ?? []
  const total = Number(order.total_amount || order.amount || 0)

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,24,28,0.98),rgba(12,12,15,0.98))] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ffe08a]/40 to-transparent" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded-full border border-[#fbd005]/18 bg-[#fbd005]/10 px-4 py-1 text-[10px] font-semibold leading-none text-[#ffe08a]">
            {getOrderBusinessType(order)}
          </span>
          {/* <h3 className="mt-2 truncate text-[15px] font-bold text-white">{formatOrderTitle(order)}</h3> */}
          <div className="mt-2 flex items-end gap-1.5">
            <span className="text-[22px] font-black leading-none text-white">{formatAmount(total, 2)}</span>
            <span className="pb-0.5 text-xs font-semibold text-white/58">USDT</span>
          </div>
          <p className="mt-1 text-[11px] text-white/38">创建时间 {order.created_at}</p>
        </div>

        {canAct ? (
          <button
            type="button"
            onClick={() => onCancel(order)}
            className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-[3px] text-[9px] font-medium text-red-300 active:opacity-70"
          >
            <svg width="8" height="8" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            取消
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {payments.map((payment) => {
          const disabled = order.status === 3 || order.status === 4 || payment.status === 2 || payment.status === 3
          return (
            <div key={payment.id} className="rounded-[16px] border border-white/8 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex flex-1 items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fbd005]/10">
                    <img
                      src={getCurrencyIconById(payment.system_currency_id)}
                      alt={getCurrencyByChainId(payment.system_currency_id)}
                      className="h-7 w-7 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{getCurrencyByChainId(payment.system_currency_id)}</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${getPaymentStateClass(order, payment)}`}>
                        {getPaymentStateLabel(order, payment)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/42">
                      <span>支付币种 {getCurrencyByChainId(payment.system_currency_id)}</span>
                      <span className="h-1 w-1 rounded-full bg-white/20" />
                      <span>比例 {payment.radio_rate ?? '--'}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{formatAmount(payment.total_amount, 2)}</div>
                    <div className="text-[11px] text-white/35">USDT</div>
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onPay(order, payment)}
                    className={`shrink-0 rounded-xl px-3 py-2 text-[11px] font-bold transition ${disabled ? 'bg-white/8 text-white/28' : 'bg-gradient-to-r from-[#fff2a2] to-[#f0ae24] text-[#171200]'}`}
                  >
                    {disabled ? (payment.status === 2 || order.status === 3 ? '已支付' : '已取消') : '支付'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
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
  const [notice, setNotice] = useState<{
    title?: string
    message: string
    confirmText?: string
    onConfirm?: () => void
  } | null>(null)
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
      setOrders(await fetchPreOrderList({ page: 1, page_size: 10 }))
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取待支付订单失败'
      setNotice({ message })
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
        icon: getCurrencyIconById(info.system_currency_id),
        balance: Number(info.systemAmount || 0),
        available: Number(info.systemAmount || 0) >= totalAmount,
        payment: 'system_balance',
      })
    }

    const targetChainId = Number(info.chainCurrency?.chain_id || 0)
    if ((paymentMethodsType === 2 || paymentMethodsType === 3) && (targetChainId === 56 || targetChainId === 399 || targetChainId === 9777) && info.chainCurrency) {
      const normalizedTargetChainId = targetChainId as SupportedChainId
      const matched = await checkChainMatch(normalizedTargetChainId)
      const balance = matched ? await getBalanceForCurrency(info.chainCurrency, normalizedTargetChainId) : 0

      methods.push({
        id: 2,
        type: 2,
        system_currency_id: info.system_currency_id,
        name: '链上支付',
        currency: info.chainCurrency.name || getCurrencyByChainId(info.system_currency_id),
        icon: getCurrencyIconById(info.system_currency_id),
        balance,
        available: matched && balance >= totalAmount,
        payment: normalizedTargetChainId === 399 ? 'chain_nadi' : normalizedTargetChainId === 9777 ? 'chain_pythia' : paymentType,
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
      setNotice({ message })
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
      setNotice({ message: '支付处理已提交' })
    } catch (error) {
      const message = error instanceof Error ? error.message : '支付失败'
      setNotice({ message })
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
      setNotice({ message })
    }
  }

  const paymentSummary = useMemo(() => ({
    orderAmount: Number(paymentInfo?.ac_amount || 0),
    price: Number(paymentInfo?.price || 0),
    orderValue: Number(paymentInfo?.total_amount || 0),
  }), [paymentInfo])

  return (
    <PageContainer bgClass="bg-[#050506]">
      <PageNavBar title="待支付订单" onBack={() => onNavigate('home')} />
{/* 
      <div className="px-4 pt-4">
        <div className="overflow-hidden rounded-[24px] border border-white/8">
          <img src="/old-pages/orders/orders-bg.png" alt="" className="h-28 w-full object-cover opacity-85" />
        </div>
      </div> */}

      <div className="space-y-3 px-4 pb-10 pt-3">
        {loading ? (
          <div className="flex flex-col items-center gap-2 py-20">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-amber-400" />
            <span className="text-sm text-white/40">加载中...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-6 py-16 text-center shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/40">
                <path d="M4 7.5H20M7 4H17M6.5 11.5H12.5M6.5 15.5H10.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M5 4.75H19C20.1046 4.75 21 5.64543 21 6.75V17.25C21 18.3546 20.1046 19.25 19 19.25H5C3.89543 19.25 3 18.3546 3 17.25V6.75C3 5.64543 3.89543 4.75 5 4.75Z" stroke="currentColor" strokeWidth="1.7" />
              </svg>
            </div>
            <p className="mt-5 text-base font-semibold text-white/72">暂无待支付订单</p>
            <p className="mt-2 text-sm text-white/35">新创建的预订单会在这里展示，并支持后续链上支付。</p>
          </div>
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
            await switchChain(method.targetChainId as SupportedChainId)
            if (paymentInfo) {
              setPaymentMethods(await buildPaymentMethods(paymentInfo))
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : '切换网络失败'
            setNotice({ message })
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

      <NoticePopup
        visible={notice !== null}
        title={notice?.title}
        message={notice?.message ?? ''}
        confirmText={notice?.confirmText}
        onClose={() => setNotice(null)}
        onConfirm={notice?.onConfirm}
      />
    </PageContainer>
  )
}
