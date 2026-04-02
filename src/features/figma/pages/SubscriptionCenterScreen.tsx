import { useCallback, useEffect, useRef, useState } from 'react'

import { subscriptionPlans as staticPlans } from '../data'
import { getSubscriptionPlans, getOrder, getOrderList } from '../services/api'
import type { SubscriptionPlanApi, OrderListItem } from '../services/api'
import { TopNavigation } from '../components/shared'
import type { CopyText, LanguageOption, SubscriptionPlan, SubscriptionPlanId } from '../types'

const ICON_MAP: Record<string, string> = {
  ops: '/figma/subscription-icon-ops.webp',
  studio: '/figma/subscription-icon-super.webp',
  super: '/figma/subscription-icon-normal.webp',
  normal: '/figma/subscription-icon-gold.webp',
}

function formatPlanAmount(price: string, priceDisplay: string): string {
  const displayValue = parseFloat(priceDisplay.replace(/[^0-9.]/g, '')) || 0
  if (displayValue > 0) {
    return priceDisplay
  }

  const rawPrice = Number.parseFloat(price)
  if (!Number.isFinite(rawPrice) || rawPrice <= 0) {
    return priceDisplay
  }

  return `${rawPrice.toLocaleString('en-US', {
    minimumFractionDigits: rawPrice < 1 ? 2 : 0,
    maximumFractionDigits: rawPrice < 1 ? 4 : 2,
  })} U`
}

function apiToLocal(p: SubscriptionPlanApi): SubscriptionPlan {
  return {
    id: p.slug as SubscriptionPlanId,
    tabLabel: p.name,
    title: p.name,
    description: p.description ?? '',
    amount: formatPlanAmount(p.price, p.price_display),
    quantity: p.quantity_display,
    icon: ICON_MAP[p.slug] ?? '/figma/subscription-icon-gold.webp',
    power: p.power_display,
    level: p.level_name,
    reinvest: p.reinvest_display,
    timeBonus: p.time_bonus_display,
    purchased: p.purchased,
  }
}

const SWIPE_THRESHOLD = 40

type SlidePhase = 'idle' | 'prep' | 'animate'

export function SubscriptionCenterScreen({
  copy,
  currentLanguage,
  walletButtonLabel,
  walletAddress,
  authToken,
  activePlan,
  onMenuToggle,
  onLanguageToggle,
  onWalletConnect,
  onSelectPlan,
  onSubscribe,
  onFeedback,
}: {
  copy: CopyText
  currentLanguage: LanguageOption
  walletButtonLabel: string
  walletAddress: string | null
  authToken: string | null
  activePlan: SubscriptionPlanId
  onMenuToggle: () => void
  onLanguageToggle: () => void
  onWalletConnect: () => void
  onSelectPlan: (planId: SubscriptionPlanId) => void
  onSubscribe: (planId: SubscriptionPlanId) => void
  onFeedback: (msg: string) => void
}) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(staticPlans)
  const [, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const fetchOrders = useCallback(() => {
    if (!authToken) return
    setOrdersLoading(true)
    getOrderList(authToken)
      .then((res) => setOrders(res.list))
      .catch(() => {})
      .finally(() => setOrdersLoading(false))
  }, [authToken])

  useEffect(() => {
    if (!authToken) return
    setLoading(true)
    getSubscriptionPlans(authToken)
      .then((list) => {
        if (list.length > 0) setPlans(list.map(apiToLocal))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    fetchOrders()
  }, [authToken, fetchOrders])

  const planIds = plans.map((p) => p.id)
  const activeIndex = Math.max(0, planIds.indexOf(activePlan))
  const plan = plans[activeIndex]

  const touchStartX = useRef(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [confirmPlan, setConfirmPlan] = useState<SubscriptionPlan | null>(null)

  const prevIndexRef = useRef(activeIndex)
  const [slideDir, setSlideDir] = useState<1 | -1>(1)
  const [slidePhase, setSlidePhase] = useState<SlidePhase>('idle')

  useEffect(() => {
    if (prevIndexRef.current === activeIndex) return
    const dir = activeIndex > prevIndexRef.current ? 1 : -1
    prevIndexRef.current = activeIndex
    setSlideDir(dir)
    setSlidePhase('prep')
  }, [activeIndex])

  useEffect(() => {
    if (slidePhase !== 'prep') return
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSlidePhase('animate'))
    })
    return () => cancelAnimationFrame(raf)
  }, [slidePhase])

  useEffect(() => {
    if (slidePhase !== 'animate') return
    const timer = setTimeout(() => setSlidePhase('idle'), 350)
    return () => clearTimeout(timer)
  }, [slidePhase])

  const goTo = useCallback(
    (dir: -1 | 1) => {
      const next = activeIndex + dir
      if (next >= 0 && next < planIds.length) onSelectPlan(planIds[next])
    },
    [activeIndex, planIds, onSelectPlan],
  )

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setDragOffset(e.touches[0].clientX - touchStartX.current)
  }

  const onTouchEnd = () => {
    if (dragOffset > SWIPE_THRESHOLD) goTo(-1)
    else if (dragOffset < -SWIPE_THRESHOLD) goTo(1)
    setDragOffset(0)
  }

  return (
    <>
      {/* ── Background ── */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_#08060a_0%,_#12100a_40%,_#0a0804_100%)]" />
      <div
        className="absolute inset-x-0 top-[60px] h-[900px] bg-cover bg-top opacity-80"
        style={{ backgroundImage: 'url(/figma/subscription-bg.webp)' }}
      />
      <div
        className="absolute inset-x-0 top-[60px] h-[760px] bg-cover bg-top opacity-70 mix-blend-screen"
        style={{ backgroundImage: 'url(/figma/subscription-overlay.webp)' }}
      />
      <div className="absolute inset-x-0 top-0 h-[300px] bg-[radial-gradient(ellipse_90%_60%_at_50%_-5%,_rgba(250,217,51,0.12),_transparent)]" />

      <TopNavigation
        copy={copy}
        currentLanguage={currentLanguage}
        walletButtonLabel={walletButtonLabel}
        onMenuToggle={onMenuToggle}
        onLanguageToggle={onLanguageToggle}
        onWalletConnect={onWalletConnect}
      />

      <div className="relative z-10 flex min-h-screen flex-col px-4 pb-8 pt-[52px]">
        {/* ── Title ── */}
        <div className="flex items-center gap-3">
          <span className="h-9 w-[5px] rounded-full bg-[#fbd005] shadow-[0_0_8px_rgba(251,208,5,0.4)]" />
          <h1 className="text-[26px] font-bold tracking-wide text-white">{copy.subscriptionCenter}</h1>
        </div>

        {/* ── Plan selector tabs ── */}
        <div className="mt-5 flex gap-1.5">
          {plans.map((p) => {
            const isActive = p.id === activePlan
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPlan(p.id)}
                className={[
                  'group relative flex flex-1 flex-col items-center gap-1 overflow-hidden rounded-[14px] pb-2.5 pt-3 transition-all duration-300',
                  isActive
                    ? 'border border-[#fbd005]/50 bg-[linear-gradient(180deg,_rgba(251,208,5,0.15)_0%,_rgba(251,208,5,0.04)_100%)] shadow-[0_0_24px_rgba(250,217,51,0.2),_inset_0_1px_0_rgba(250,217,51,0.15)]'
                    : 'border border-white/8 bg-white/[0.06] hover:bg-white/[0.1]',
                ].join(' ')}
              >
                <img
                  src={p.icon}
                  alt=""
                  className={[
                    'h-7 w-7 object-contain transition-all duration-300',
                    isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(250,217,51,0.6)]' : 'opacity-60',
                  ].join(' ')}
                />
                <span
                  className={[
                    'text-[10px] font-semibold leading-tight transition-colors duration-200',
                    isActive ? 'text-[#fbd005]' : 'text-white/60',
                  ].join(' ')}
                >
                  {p.tabLabel}
                </span>
                <span
                  className={[
                    'text-[9px] tabular-nums transition-colors duration-200',
                    isActive ? 'text-white' : 'text-white/35',
                  ].join(' ')}
                >
                  {p.amount}
                </span>
                {/* Active indicator bar */}
                <div
                  className={[
                    'absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 rounded-full transition-all duration-300',
                    isActive ? 'w-8 bg-[#fbd005] shadow-[0_0_10px_rgba(251,208,5,0.7)]' : 'w-0 bg-transparent',
                  ].join(' ')}
                />
              </button>
            )
          })}
        </div>

        {/* ── Swipeable card area ── */}
        <div
          className="relative mt-5 flex-1"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Left arrow */}
          {activeIndex > 0 && (
            <button
              type="button"
              onClick={() => goTo(-1)}
              className="absolute -left-1 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/70 backdrop-blur-sm transition hover:bg-black/60 hover:text-white"
            >
              <ChevronIcon direction="left" />
            </button>
          )}

          {/* Right arrow */}
          {activeIndex < planIds.length - 1 && (
            <button
              type="button"
              onClick={() => goTo(1)}
              className="absolute -right-1 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/70 backdrop-blur-sm transition hover:bg-black/60 hover:text-white"
            >
              <ChevronIcon direction="right" />
            </button>
          )}

          <PlanCard
            key={plan.id}
            plan={plan}
            copy={copy}
            dragOffset={dragOffset}
            slideDir={slideDir}
            slidePhase={slidePhase}
            onSubscribe={() => setConfirmPlan(plan)}
          />
        </div>

        {/* ── Dot indicators ── */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {planIds.map((id, i) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelectPlan(id)}
              className={[
                'h-[6px] rounded-full transition-all duration-300',
                i === activeIndex
                  ? 'w-6 bg-[#fbd005] shadow-[0_0_6px_rgba(251,208,5,0.5)]'
                  : 'w-[6px] bg-white/20 hover:bg-white/30',
              ].join(' ')}
            />
          ))}
        </div>

        {/* ── Purchase history ── */}
        <OrderHistory orders={orders} loading={ordersLoading} />
      </div>

      {/* ── Confirm sheet backdrop ── */}
      {confirmPlan && (
        <button
          type="button"
          aria-label="關閉確認面板"
          onClick={() => setConfirmPlan(null)}
          className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300"
        />
      )}

      {/* ── Confirm sheet ── */}
      <SubscribeConfirmSheet
        plan={confirmPlan}
        walletAddress={walletAddress}
        authToken={authToken}
        onClose={() => setConfirmPlan(null)}
        onSuccess={(planId) => {
          setConfirmPlan(null)
          onSubscribe(planId)
          fetchOrders()
        }}
        onError={(msg) => {
          setConfirmPlan(null)
          onFeedback(msg)
        }}
      />
    </>
  )
}

/* ────────────────────── Confirm Bottom Sheet ────────────────────── */

const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955'
const BALANCE_OF_SELECTOR = '0x70a08231'

function useUsdtBalance(walletAddress: string | null, isOpen: boolean) {
  const [balance, setBalance] = useState<string | null>(null)
  const [balanceRaw, setBalanceRaw] = useState<bigint>(0n)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!walletAddress || !isOpen || !window.ethereum) {
      setBalance(null)
      setBalanceRaw(0n)
      return
    }

    let cancelled = false
    setLoading(true)

    const paddedAddr = walletAddress.slice(2).toLowerCase().padStart(64, '0')
    const data = `${BALANCE_OF_SELECTOR}${paddedAddr}`

    window.ethereum
      .request({
        method: 'eth_call',
        params: [{ to: USDT_CONTRACT, data }, 'latest'],
      } as { method: string })
      .then((result) => {
        if (cancelled) return
        const hex = String(result)
        const raw = BigInt(hex)
        if (!cancelled) setBalanceRaw(raw)
        const decimals = 10n ** 18n
        const integer = raw / decimals
        const fraction = raw % decimals
        const intStr = integer.toLocaleString('en-US')
        const fracStr = String(fraction).padStart(18, '0').slice(0, 2)
        setBalance(`${intStr}.${fracStr}`)
      })
      .catch(() => {
        if (!cancelled) { setBalance(null); setBalanceRaw(0n) }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [walletAddress, isOpen])

  return { balance, balanceRaw, loading }
}

const APPROVE_SELECTOR = '0x095ea7b3'
const MAX_UINT256 = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

function parseAmountToWei(amountText: string, decimals = 18): bigint {
  const normalized = amountText.replace(/[^0-9.]/g, '').trim()
  if (!normalized) {
    return 0n
  }

  const [integerPart, decimalPart = ''] = normalized.split('.')
  const safeIntegerPart = integerPart || '0'
  const paddedDecimalPart = decimalPart.padEnd(decimals, '0').slice(0, decimals)

  return BigInt(`${safeIntegerPart}${paddedDecimalPart}`)
}

function SubscribeConfirmSheet({
  plan,
  walletAddress,
  authToken,
  onClose,
  onSuccess,
  onError,
}: {
  plan: SubscriptionPlan | null
  walletAddress: string | null
  authToken: string | null
  onClose: () => void
  onSuccess: (planId: SubscriptionPlanId) => void
  onError: (msg: string) => void
}) {
  const isOpen = plan !== null
  const { balance, balanceRaw, loading } = useUsdtBalance(walletAddress, isOpen)
  const [paying, setPaying] = useState(false)
  const [statusText, setStatusText] = useState('')

  let balanceDisplay: string
  if (!walletAddress) balanceDisplay = '--'
  else if (loading) balanceDisplay = '...'
  else if (balance !== null) balanceDisplay = balance
  else balanceDisplay = '0.00'

  const priceWei = plan ? parseAmountToWei(plan.amount) : 0n
  const insufficient = walletAddress && !loading && balanceRaw < priceWei
  const canPay = !paying && !!walletAddress && !insufficient

  const handlePay = async () => {
    if (!plan || !walletAddress || !authToken || !window.ethereum || paying || insufficient) return

    try {
      setPaying(true)

      setStatusText('正在生成訂單…')
      const order = await getOrder(authToken, plan.id)

      setStatusText('授權 USDT…')
      const approveData = `${APPROVE_SELECTOR}${order.recharge_contract.slice(2).toLowerCase().padStart(64, '0')}${MAX_UINT256}`
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: order.usdt_contract,
          data: approveData,
        }],
      } as { method: string })

      setStatusText('發送交易…')
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: order.recharge_contract,
          data: order.tx_data,
        }],
      } as { method: string }) as string

      setStatusText('')
      void txHash
      onSuccess(plan.id)
    } catch (err) {
      setStatusText('')
      const msg = err instanceof Error ? err.message : '交易失敗'
      onError(msg)
    } finally {
      setPaying(false)
    }
  }

  return (
    <div
      className={[
        'absolute inset-x-0 bottom-0 z-40 rounded-t-[24px] transition-transform duration-400 ease-out',
        isOpen ? 'translate-y-0' : 'translate-y-full',
      ].join(' ')}
      style={{
        backgroundImage:
          'linear-gradient(180deg, #1e1a12 0%, #131008 100%)',
      }}
    >
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-[4px] w-10 rounded-full bg-white/20" />
      </div>

      <div className="px-5 pb-8 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-white">確認認購</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={paying}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/15 hover:text-white disabled:opacity-40"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1="5" y1="5" x2="15" y2="15" />
              <line x1="15" y1="5" x2="5" y2="15" />
            </svg>
          </button>
        </div>

        {plan && (
          <>
            <div className="mt-4 flex items-center gap-3.5 rounded-[16px] border border-[#fbd005]/20 bg-white/[0.06] px-4 py-3.5">
              <img
                src={plan.icon}
                alt=""
                className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(250,217,51,0.3)]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-white">{plan.title}</p>
                <p className="mt-0.5 text-[12px] text-white/50">{plan.description}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <DetailRow label="認購金額" value={plan.amount} highlight />
              <DetailRow label="獲得算力" value={plan.power} />
              <DetailRow label="節點等級" value={plan.level} />
              <DetailRow label="剩餘數量" value={plan.quantity} />
            </div>

            <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="rounded-[14px] border border-white/[0.08] bg-white/[0.04] px-4 py-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#26a17b]">
                    <span className="text-[12px] font-bold text-white">₮</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white">USDT</p>
                    <p className="text-[10px] text-white/40">BEP-20</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/40">鏈上餘額</p>
                  <p className="text-[15px] font-bold tabular-nums text-white">
                    {balanceDisplay}
                    <span className="ml-1 text-[11px] font-normal text-white/40">USDT</span>
                  </p>
                </div>
              </div>

              {!walletAddress && (
                <p className="mt-2.5 text-[11px] text-amber-400/80">
                  請先連接錢包以查看餘額
                </p>
              )}
              {insufficient && (
                <p className="mt-2.5 text-[11px] text-red-400/90">
                  餘額不足，無法完成支付
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handlePay}
              disabled={!canPay}
              className="mt-5 h-[52px] w-full rounded-[14px] bg-[linear-gradient(90deg,_#efac40,_#fbd005)] text-[17px] font-bold tracking-wide text-black shadow-[0_4px_20px_rgba(251,208,5,0.3)] transition-all active:scale-[0.98] active:brightness-95 disabled:opacity-50"
            >
              {paying ? statusText || '處理中…' : insufficient ? '餘額不足' : `確認支付 · ${plan.amount}`}
            </button>

            <p className="mt-3 text-center text-[10px] text-white/30">
              確認後將發起鏈上交易，請確保錢包餘額充足
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-white/50">{label}</span>
      <span
        className={
          highlight
            ? 'bg-[linear-gradient(90deg,_#fad933,_#efac40)] bg-clip-text text-[15px] font-bold text-transparent'
            : 'text-[13px] font-medium text-white/90'
        }
      >
        {value}
      </span>
    </div>
  )
}

/* ────────────────────── Order History ────────────────────── */

const STATUS_COLORS: Record<number, string> = {
  0: 'text-amber-400',
  1: 'text-blue-400',
  2: 'text-emerald-400',
  3: 'text-red-400/70',
  4: 'text-white/30',
}

function OrderHistory({ orders, loading }: { orders: OrderListItem[]; loading: boolean }) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="h-5 w-[3px] rounded-full bg-[#fbd005]" />
        <h2 className="text-[17px] font-bold text-white">購買記錄</h2>
      </div>

      {loading && orders.length === 0 && (
        <div className="flex justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#fbd005]" />
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.03] py-10 text-center">
          <p className="text-[13px] text-white/30">暫無購買記錄</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-2.5">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-[14px] border border-white/[0.08] bg-white/[0.04] px-4 py-3.5"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-white truncate">{o.plan_name}</p>
                  <p className="mt-1 text-[11px] tabular-nums text-white/35">{o.created_at}</p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className="text-[14px] font-bold tabular-nums text-white">{o.amount_display}</p>
                  <p className={`mt-1 text-[11px] font-medium ${STATUS_COLORS[o.status] ?? 'text-white/40'}`}>
                    {o.status_text}
                  </p>
                </div>
              </div>
              {o.tx_hash && (
                <p className="mt-2 truncate text-[10px] tabular-nums text-white/20">
                  TX: {o.tx_hash}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ────────────────────── Large Plan Card ────────────────────── */

function PlanCard({
  plan,
  copy,
  dragOffset,
  slideDir,
  slidePhase,
  onSubscribe,
}: {
  plan: SubscriptionPlan
  copy: CopyText
  dragOffset: number
  slideDir: 1 | -1
  slidePhase: SlidePhase
  onSubscribe: () => void
}) {
  const clamped = Math.max(-60, Math.min(60, dragOffset))

  let tx = clamped
  let opacity = 1
  let transition = 'transform 150ms ease-out'

  if (slidePhase === 'prep') {
    tx = slideDir * 100
    opacity = 0
    transition = 'none'
  } else if (slidePhase === 'animate') {
    tx = 0
    opacity = 1
    transition = 'transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 280ms ease-out'
  }

  return (
    <article
      className="relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[#fff1ae]/60 shadow-[0_0_36px_rgba(250,217,51,0.08),_0_20px_50px_rgba(0,0,0,0.5)]"
      style={{
        backgroundImage:
          'linear-gradient(225deg, rgba(76,62,36,0.95) 1%, rgba(41,37,34,0.97) 28%, rgba(10,7,5,0.99) 77%)',
        transform: `translateX(${tx}px)`,
        opacity,
        transition,
      }}
    >
      {/* Corner glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(250,217,51,0.14),_transparent_65%)]" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(250,217,51,0.06),_transparent_65%)]" />

      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        {/* Header: icon + title + quantity badge */}
        <div className="flex items-center gap-3">
          <img
            src={plan.icon}
            alt=""
            className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(250,217,51,0.3)]"
          />
          <div className="min-w-0">
            <h2 className="text-[20px] font-bold text-white">{plan.title}</h2>
          </div>
          <div className="ml-auto shrink-0 rounded-full bg-[rgba(251,208,5,0.12)] px-3.5 py-1">
            <span className="bg-[linear-gradient(90deg,_#efac40,_#fbd005)] bg-clip-text text-[12px] font-semibold text-transparent">
              數量：{plan.quantity}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="mt-2 text-[12px] leading-relaxed text-white/50">
          {plan.description}
        </p>

        {/* Amount */}
        <p className="mt-4 bg-[linear-gradient(180deg,_#fad933_0%,_#efac40_52%,_#95600f_100%)] bg-clip-text text-[36px] font-extrabold leading-none tracking-wider text-transparent">
          {plan.amount}
        </p>

        {/* Divider */}
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#fad933]/20 to-transparent" />

        {/* ── Primary stats: Power ring + Level ── */}
        <PrimaryStats power={plan.power} level={plan.level} />

        {/* ── Secondary stats ── */}
        {(plan.reinvest !== '-' || plan.timeBonus !== '-') && (
          <div className="mt-3 flex gap-2">
            {plan.reinvest !== '-' && <SecondaryBadge label="復投" value={plan.reinvest} />}
            {plan.timeBonus !== '-' && <SecondaryBadge label="時間" value={plan.timeBonus} />}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <button
          type="button"
          onClick={onSubscribe}
          disabled={plan.purchased}
          className={[
            'mt-5 h-[50px] w-full rounded-[14px] text-[17px] font-bold tracking-wide transition-shadow',
            plan.purchased
              ? 'bg-white/10 text-white/40 cursor-not-allowed'
              : 'bg-[linear-gradient(90deg,_#efac40,_#fbd005)] text-black shadow-[0_4px_20px_rgba(251,208,5,0.25)] hover:shadow-[0_6px_28px_rgba(251,208,5,0.4)] active:brightness-95',
          ].join(' ')}
        >
          {plan.purchased ? '已購買' : copy.subscribeNow}
        </button>
      </div>
    </article>
  )
}

/* ────────────────────── Primary stats: ring + level ────────────────────── */

function PrimaryStats({ power, level }: { power: string; level: string }) {
  const parts = power.split(' · ')
  const multiplier = parts[0] ?? power
  const capacity = parts[1] ?? ''

  const mult = parseFloat(multiplier) || 3
  const pct = Math.min((mult / 5) * 100, 100)
  const r = 38
  const c = 2 * Math.PI * r
  const offset = c - (c * pct) / 100

  return (
    <div className="flex items-center gap-4">
      {/* Power ring */}
      <div className="relative flex shrink-0 items-center justify-center">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle
            cx="48" cy="48" r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="5"
          />
          <circle
            cx="48" cy="48" r={r}
            fill="none"
            stroke="url(#gold-ring)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
          />
          <defs>
            <linearGradient id="gold-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbd005" />
              <stop offset="100%" stopColor="#efac40" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="bg-[linear-gradient(180deg,_#fad933,_#efac40)] bg-clip-text text-[22px] font-extrabold leading-none text-transparent">
            {multiplier}
          </span>
          {capacity && (
            <span className="mt-0.5 text-[9px] font-medium text-white/45">{capacity}</span>
          )}
        </div>
      </div>

      {/* Right side: level + label */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-white/35">算力倍數</span>
          <span className="h-px flex-1 bg-white/[0.06]" />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 items-center justify-center rounded-[10px] border border-[#fbd005]/25 bg-[#fbd005]/[0.08] px-4">
            <span className="text-[18px] font-extrabold text-[#fbd005]">{level}</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/35">等級</p>
            <p className="text-[12px] font-medium text-white/70">Level {level}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────── Secondary badge ────────────────────── */

function SecondaryBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 items-center gap-2.5 rounded-[12px] border border-[#fbd005]/10 bg-[#fbd005]/[0.04] px-3 py-2.5">
      <div className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#fbd005]/60" />
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wider text-white/35">{label}</p>
        <p className="mt-0.5 truncate text-[12px] font-semibold text-white/90">{value}</p>
      </div>
    </div>
  )
}

/* ────────────────────── Chevron icon ────────────────────── */

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === 'left' ? (
        <polyline points="13,4 7,10 13,16" />
      ) : (
        <polyline points="7,4 13,10 7,16" />
      )}
    </svg>
  )
}
