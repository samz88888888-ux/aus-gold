import { useCallback, useEffect, useRef, useState } from 'react'

import { subscriptionPlans as staticPlans } from '../data'
import { getSubscriptionPlans, getOrder, getOrderList } from '../services/api'
import type { SubscriptionPlanApi, OrderListItem } from '../services/api'
import { TopNavigation } from '../components/shared'
import type { CopyText, LanguageOption, SubscriptionPlan, SubscriptionPlanId } from '../types'
import { assetUrl } from '../utils/assets'
import { formatUnits, getChainConfig, getCurrentChainHexId, getErc20Allowance, getErc20Balance, parseUnits, switchOrAddChain, waitForReceipt } from '../../old-pages/services/evm'
import usdtCoinIcon from '../../../assets/coin/usdt-coin.png'

const ICON_MAP: Record<string, string> = {
  ops: assetUrl('/figma/subscription-icon-ops.webp'),
  studio: assetUrl('/figma/subscription-icon-super.webp'),
  super: assetUrl('/figma/subscription-icon-normal.webp'),
  normal: assetUrl('/figma/subscription-icon-gold.webp'),
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

function normalizeAmountValue(amountText: string): string {
  return amountText.replace(/[^0-9.,]/g, '').replace(/,/g, '').trim()
}

function apiToLocal(p: SubscriptionPlanApi): SubscriptionPlan {
  return {
    id: p.slug as SubscriptionPlanId,
    tabLabel: p.name,
    title: p.name,
    description: p.description ?? '',
    amount: formatPlanAmount(p.price, p.price_display),
    quantity: p.quantity_display,
    icon: ICON_MAP[p.slug] ?? assetUrl('/figma/subscription-icon-gold.webp'),
    power: p.power_display,
    level: p.level_name,
    reinvest: p.reinvest_display,
    timeBonus: p.time_bonus_display,
    purchased: p.purchased,
    currency: p.currency
      ? {
          name: p.currency.name,
          contractAddress: p.currency.contract_address,
          decimals: p.currency.decimals,
          chainId: p.currency.chain_id,
        }
      : undefined,
  }
}

const SWIPE_THRESHOLD = 40

type SlidePhase = 'idle' | 'prep' | 'animate'

const sectionCardClass =
  'rounded-[24px] border border-black/5 bg-white shadow-[0_8px_24px_rgba(200,164,54,0.18)]'

const softCardClass =
  'rounded-[18px] border border-black/5 bg-[#fffdf7] shadow-[0_6px_18px_rgba(200,164,54,0.12)]'

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
    getSubscriptionPlans(authToken)
      .then((list) => {
        if (list.length > 0) setPlans(list.map(apiToLocal))
      })
      .catch(() => {})

    const timer = window.setTimeout(() => {
      fetchOrders()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [authToken, fetchOrders])

  const planIds = plans.map((p) => p.id)
  const activeIndex = Math.max(0, planIds.indexOf(activePlan))
  const plan = plans[activeIndex]

  const touchStartX = useRef(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [confirmPlan, setConfirmPlan] = useState<SubscriptionPlan | null>(null)

  const [slideDir, setSlideDir] = useState<1 | -1>(1)
  const [slidePhase, setSlidePhase] = useState<SlidePhase>('idle')

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
      if (next >= 0 && next < planIds.length) {
        setSlideDir(dir)
        setSlidePhase('prep')
        onSelectPlan(planIds[next])
      }
    },
    [activeIndex, planIds, onSelectPlan],
  )

  const handlePlanSelect = useCallback(
    (planId: SubscriptionPlanId) => {
      const nextIndex = planIds.indexOf(planId)
      if (nextIndex === -1 || nextIndex === activeIndex) return
      setSlideDir(nextIndex > activeIndex ? 1 : -1)
      setSlidePhase('prep')
      onSelectPlan(planId)
    },
    [activeIndex, onSelectPlan, planIds],
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
      <div className="absolute inset-0 bg-[#f8f8f5]" />
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_top,rgba(250,217,51,0.3),rgba(250,217,51,0.08)_36%,transparent_72%)]" />
      <div className="absolute inset-x-0 top-[110px] h-[260px] bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(248,248,245,1))]" />

      <TopNavigation
        copy={copy}
        currentLanguage={currentLanguage}
        walletButtonLabel={walletButtonLabel}
        onMenuToggle={onMenuToggle}
        onLanguageToggle={onLanguageToggle}
        onWalletConnect={onWalletConnect}
      />

      <div className="relative z-10 flex min-h-screen flex-col px-4 pb-10 pt-[70px] text-[#171717]">
        <section className={`${sectionCardClass} px-5 py-5`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d7ab1e]">
            Premium Subscription
          </p>
          <h1 className="mt-2 text-[28px] font-black tracking-[0.02em] text-black">{copy.subscriptionCenter}</h1>
          <p className="mt-2 text-[13px] leading-[22px] text-black/58">
            選擇最適合你的節點方案，獲得對應算力、等級權益與長期生態分紅資格。
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-full border border-[#fad933]/30 bg-[#fad933]/14 px-3 py-1 text-[10px] font-semibold text-[#c58b1f]">
              已上線 {plans.length} 種方案
            </span>
            {/* <span className="rounded-full border border-black/8 bg-black px-3 py-1 text-[10px] font-semibold text-[#fce596]">
              同步首頁新版視覺
            </span> */}
          </div>
        </section>

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d7ab1e]">Plan Selector</p>
              <h2 className="mt-1 text-[20px] font-black text-black">選擇認購方案</h2>
            </div>
            <span className="rounded-full border border-black/8 bg-white px-3 py-1 text-[10px] font-semibold text-black/45 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              左右滑動切換
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {plans.map((p) => {
            const isActive = p.id === activePlan
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePlanSelect(p.id)}
                className={[
                  'group relative flex flex-col items-center gap-1 overflow-hidden rounded-[18px] px-2 pb-3 pt-3 transition-all duration-300',
                  isActive
                    ? 'border border-[#fbd005] bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(251,208,5,0.18)_100%)] shadow-[0_10px_26px_rgba(250,217,51,0.22)]'
                    : 'border border-black/5 bg-white shadow-[0_6px_16px_rgba(0,0,0,0.04)] hover:border-[#fad933]/35 hover:bg-[#fffdf8]',
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
                    isActive ? 'text-[#b47a16]' : 'text-black/60',
                  ].join(' ')}
                >
                  {p.tabLabel}
                </span>
                <span
                  className={[
                    'text-[9px] tabular-nums transition-colors duration-200',
                    isActive ? 'text-black/70' : 'text-black/35',
                  ].join(' ')}
                >
                  {p.amount}
                </span>
                {/* Active indicator bar */}
                <div
                  className={[
                    'absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 rounded-full transition-all duration-300',
                    isActive ? 'w-8 bg-[#fbd005] shadow-[0_0_10px_rgba(251,208,5,0.45)]' : 'w-0 bg-transparent',
                  ].join(' ')}
                />
              </button>
            )
          })}
        </div>

        <div
          className="relative mt-5 flex-1"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {activeIndex > 0 && (
            <button
              type="button"
              onClick={() => goTo(-1)}
              className="absolute -left-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white text-black/55 shadow-[0_8px_18px_rgba(0,0,0,0.08)] transition hover:text-black"
            >
              <ChevronIcon direction="left" />
            </button>
          )}

          {activeIndex < planIds.length - 1 && (
            <button
              type="button"
              onClick={() => goTo(1)}
              className="absolute -right-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white text-black/55 shadow-[0_8px_18px_rgba(0,0,0,0.08)] transition hover:text-black"
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

        <div className="mt-5 flex items-center justify-center gap-2">
          {planIds.map((id, i) => (
            <button
              key={id}
              type="button"
              onClick={() => handlePlanSelect(id)}
              className={[
                'h-[6px] rounded-full transition-all duration-300',
                i === activeIndex
                  ? 'w-6 bg-[#fbd005] shadow-[0_0_6px_rgba(251,208,5,0.45)]'
                  : 'w-[6px] bg-black/12 hover:bg-black/20',
              ].join(' ')}
            />
          ))}
        </div>

        <OrderHistory orders={orders} loading={ordersLoading} />
      </div>

      {confirmPlan && (
        <button
          type="button"
          aria-label="關閉確認面板"
          onClick={() => setConfirmPlan(null)}
          className="absolute inset-0 z-30 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300"
        />
      )}

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

function usePlanTokenBalance(
  walletAddress: string | null,
  plan: SubscriptionPlan | null,
  isOpen: boolean,
) {
  const [balance, setBalance] = useState<string | null>(null)
  const [balanceRaw, setBalanceRaw] = useState<bigint>(0n)
  const [loading, setLoading] = useState(false)
  const [chainMatched, setChainMatched] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)

  const tokenAddress = plan?.currency?.contractAddress?.trim() ?? ''
  const tokenDecimals = plan?.currency?.decimals ?? 18
  const chainId = plan?.currency?.chainId ?? null

  useEffect(() => {
    const ethereum = window.ethereum
    if (!isOpen || !ethereum?.on) {
      return
    }

    const handleChainChanged = () => {
      setRefreshTick((value) => value + 1)
    }

    const handleAccountsChanged = () => {
      setRefreshTick((value) => value + 1)
    }

    ethereum.on('chainChanged', handleChainChanged)
    ethereum.on('accountsChanged', handleAccountsChanged)
    return () => {
      ethereum.removeListener?.('chainChanged', handleChainChanged)
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged)
    }
  }, [isOpen])

  useEffect(() => {
    if (!walletAddress || !isOpen || !window.ethereum || !tokenAddress || !chainId) {
      setBalance(null)
      setBalanceRaw(0n)
      setChainMatched(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setChainMatched(false)

    Promise.all([
      getCurrentChainHexId(),
      getErc20Balance(tokenAddress, walletAddress),
    ])
      .then(([currentChainHexId, raw]) => {
        if (cancelled) return
        const targetChainHexId = getChainConfig(chainId as 56 | 399 | 9777).chainHexId.toLowerCase()
        const matched = currentChainHexId === targetChainHexId
        setChainMatched(matched)
        setBalanceRaw(raw)
        const formatted = Number(formatUnits(raw, tokenDecimals, 2)).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        setBalance(formatted)
      })
      .catch(() => {
        if (!cancelled) {
          setBalance(null)
          setBalanceRaw(0n)
          setChainMatched(false)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [walletAddress, isOpen, tokenAddress, tokenDecimals, chainId, refreshTick])

  return { balance, balanceRaw, loading, chainMatched }
}

const APPROVE_SELECTOR = '0x095ea7b3'
const MAX_UINT256 = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
const MANUAL_GAS_LIMIT_HEX = '0xf4240'

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
  const { balance, balanceRaw, loading, chainMatched } = usePlanTokenBalance(walletAddress, plan, isOpen)
  const [paying, setPaying] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [switchingChain, setSwitchingChain] = useState(false)

  const paymentCurrencyName = plan?.currency?.name || 'USDT'
  const paymentChainId = plan?.currency?.chainId ?? 9777
  const paymentChainConfig = getChainConfig(paymentChainId as 56 | 399 | 9777)
  const paymentTokenDecimals = plan?.currency?.decimals ?? 18

  let balanceDisplay: string
  if (!walletAddress) balanceDisplay = '--'
  else if (loading) balanceDisplay = '...'
  else if (balance !== null) balanceDisplay = balance
  else balanceDisplay = '0.00'

  const priceWei = plan ? parseUnits(normalizeAmountValue(plan.amount), paymentTokenDecimals) : 0n
  const insufficient = walletAddress && chainMatched && !loading && balanceRaw < priceWei
  const canPay = !paying && !!walletAddress && chainMatched && !insufficient

  const handleSwitchChain = async () => {
    if (switchingChain) return
    try {
      setSwitchingChain(true)
      await switchOrAddChain(paymentChainId as 56 | 399 | 9777)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '切换网络失败'
      onError(msg)
    } finally {
      setSwitchingChain(false)
    }
  }

  const handlePay = async () => {
    if (!plan || !walletAddress || !authToken || !window.ethereum || paying || insufficient || !chainMatched) return

    try {
      setPaying(true)

      setStatusText('正在生成訂單…')
      const order = await getOrder(authToken, plan.id)

      const requiredAllowance = BigInt(order.amount_wei)
      const currentAllowance = await getErc20Allowance(order.usdt_contract, walletAddress, order.recharge_contract)

      if (currentAllowance < requiredAllowance) {
        setStatusText('授權 USDT…')
        const approveData = `${APPROVE_SELECTOR}${order.recharge_contract.slice(2).toLowerCase().padStart(64, '0')}${MAX_UINT256}`
        const approveTxHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: walletAddress,
            to: order.usdt_contract,
            data: approveData,
            gas: MANUAL_GAS_LIMIT_HEX,
          }],
        } as { method: string }) as string

        setStatusText('等待授權確認…')
        const approveReceipt = await waitForReceipt(approveTxHash)
        if (!approveReceipt || (approveReceipt as { status?: string }).status === '0x0') {
          throw new Error('授权交易失败，请稍后重试')
        }
      }

      setStatusText('發送交易…')
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: order.recharge_contract,
          data: order.tx_data,
          gas: MANUAL_GAS_LIMIT_HEX,
        }],
      } as { method: string }) as string

      setStatusText('等待支付確認…')
      const payReceipt = await waitForReceipt(txHash)
      if (!payReceipt || (payReceipt as { status?: string }).status === '0x0') {
        throw new Error('支付交易失败，请稍后重试')
      }

      setStatusText('')
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
      style={{ backgroundColor: '#fffdf8' }}
    >
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-[4px] w-10 rounded-full bg-black/12" />
      </div>

      <div className="px-5 pb-8 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-black">確認認購</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={paying}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/8 bg-black/4 text-black/50 transition hover:bg-black/8 hover:text-black disabled:opacity-40"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1="5" y1="5" x2="15" y2="15" />
              <line x1="15" y1="5" x2="5" y2="15" />
            </svg>
          </button>
        </div>

        {plan && (
          <>
            <div className="mt-4 flex items-center gap-3.5 rounded-[16px] border border-[#fbd005]/20 bg-[#fff7d6] px-4 py-3.5">
              <img
                src={plan.icon}
                alt=""
                className="h-12 w-12 shrink-0 rounded-[14px] bg-white p-1.5 object-contain shadow-[0_8px_16px_rgba(200,164,54,0.16)]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-black">{plan.title}</p>
                <p className="mt-0.5 text-[12px] text-black/50">{plan.description}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <DetailRow label="認購金額" value={plan.amount} highlight />
              <DetailRow label="獲得算力" value={plan.power} />
              <DetailRow label="節點等級" value={plan.level} />
              <DetailRow label="剩餘數量" value={plan.quantity} />
            </div>

            <div className="my-4 h-px bg-linear-to-r from-transparent via-[#fad933]/35 to-transparent" />

            <div className={`${softCardClass} px-4 py-3.5`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#26a17b]/10">
                    <img src={usdtCoinIcon} alt="USDT" className="h-7 w-7 object-contain" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-black">{paymentCurrencyName}</p>
                    <p className="text-[10px] text-black/40">{paymentChainConfig.chainName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-black/40">鏈上餘額</p>
                  <p className="text-[15px] font-bold tabular-nums text-black">
                    {balanceDisplay}
                    <span className="ml-1 text-[11px] font-normal text-black/40">{paymentCurrencyName}</span>
                  </p>
                </div>
              </div>

              {!walletAddress && (
                <p className="mt-2.5 text-[11px] text-amber-400/80">
                  請先連接錢包以查看餘額
                </p>
              )}
              {walletAddress && !loading && !chainMatched && (
                <div className="mt-2.5 flex items-center justify-between gap-3 rounded-[12px] border border-amber-300/35 bg-amber-50 px-3 py-2.5">
                  <p className="text-[11px] leading-5 text-amber-700">
                    当前网络不符合，请切换到 {paymentChainConfig.chainName}
                  </p>
                  <button
                    type="button"
                    onClick={handleSwitchChain}
                    disabled={switchingChain || paying}
                    className="shrink-0 rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-[#fce596] disabled:opacity-50"
                  >
                    {switchingChain ? '切换中…' : `切换到${paymentChainConfig.chainName}`}
                  </button>
                </div>
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
              className="mt-5 h-[52px] w-full rounded-[14px] bg-black text-[17px] font-bold tracking-wide text-[#fce596] shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition-all active:scale-[0.98] active:brightness-95 disabled:opacity-50"
            >
              {paying
                ? statusText || '處理中…'
                : !chainMatched && walletAddress
                  ? `请先切换到 ${paymentChainConfig.chainName}`
                  : insufficient
                    ? '餘額不足'
                    : `確認支付 · ${plan.amount}`}
            </button>

            <p className="mt-3 text-center text-[10px] text-black/30">
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
      <span className="text-[13px] text-black/50">{label}</span>
      <span
        className={
          highlight
            ? 'bg-[linear-gradient(90deg,#fad933,#efac40)] bg-clip-text text-[15px] font-bold text-transparent'
            : 'text-[13px] font-medium text-black/90'
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
  4: 'text-black/30',
}

function OrderHistory({ orders, loading }: { orders: OrderListItem[]; loading: boolean }) {
  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="h-5 w-[3px] rounded-full bg-[#fbd005]" />
        <h2 className="text-[17px] font-bold text-black">購買記錄</h2>
      </div>

      {loading && orders.length === 0 && (
        <div className="flex justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/10 border-t-[#fbd005]" />
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className={`${sectionCardClass} py-10 text-center`}>
          <p className="text-[13px] text-black/35">暫無購買記錄</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-2.5">
          {orders.map((o) => (
            <div
              key={o.id}
              className={`${softCardClass} px-4 py-3.5`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-black">{o.plan_name}</p>
                  <p className="mt-1 text-[11px] tabular-nums text-black/35">{o.created_at}</p>
                </div>
                <div className="ml-3 shrink-0 text-right">
                  <p className="text-[14px] font-bold tabular-nums text-black">{o.amount_display}</p>
                  <p className={`mt-1 text-[11px] font-medium ${STATUS_COLORS[o.status] ?? 'text-white/40'}`}>
                    {o.status_text}
                  </p>
                </div>
              </div>
              {o.tx_hash && (
                <p className="mt-2 truncate text-[10px] tabular-nums text-black/25">
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
      className="relative flex h-full flex-col overflow-hidden rounded-[26px] border border-[#fad933]/35 shadow-[0_12px_30px_rgba(200,164,54,0.18)]"
      style={{
        backgroundImage:
          'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,247,209,0.82) 100%)',
        transform: `translateX(${tx}px)`,
        opacity,
        transition,
      }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(250,217,51,0.16),transparent_65%)]" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(250,217,51,0.08),transparent_65%)]" />

      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <div className="flex items-center gap-3">
          <img
            src={plan.icon}
            alt=""
            className="h-12 w-12 shrink-0 rounded-[14px] bg-white p-1.5 object-contain shadow-[0_8px_18px_rgba(200,164,54,0.16)]"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d7ab1e]">Subscription Plan</p>
            <h2 className="text-[20px] font-bold text-black">{plan.title}</h2>
          </div>
          <div className="ml-auto shrink-0 rounded-full border border-[#fad933]/25 bg-[#fad933]/14 px-3.5 py-1">
            <span className="text-[12px] font-semibold text-[#b57a17]">
              數量：{plan.quantity}
            </span>
          </div>
        </div>

        <p className="mt-2 text-[12px] leading-relaxed text-black/58">
          {plan.description}
        </p>

        <p className="mt-5 text-[34px] font-black leading-none tracking-[0.02em] text-black">
          {plan.amount}
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-black/35">Node Price</p>

        <div className="my-4 h-px bg-linear-to-r from-transparent via-[#fad933]/35 to-transparent" />

        <PrimaryStats power={plan.power} level={plan.level} />

        {(plan.reinvest !== '-' || plan.timeBonus !== '-') && (
          <div className="mt-3 flex gap-2">
            {plan.reinvest !== '-' && <SecondaryBadge label="復投" value={plan.reinvest} />}
            {plan.timeBonus !== '-' && <SecondaryBadge label="時間" value={plan.timeBonus} />}
          </div>
        )}

        <div className="flex-1" />

        <button
          type="button"
          onClick={onSubscribe}
          disabled={plan.purchased}
          className={[
            'mt-5 h-[50px] w-full rounded-[14px] text-[17px] font-bold tracking-wide transition-shadow',
            plan.purchased
              ? 'cursor-not-allowed border border-black/10 bg-black/5 text-black/30'
              : 'bg-black text-[#fce596] shadow-[0_8px_20px_rgba(0,0,0,0.18)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.22)] active:brightness-95',
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
      <div className="relative flex shrink-0 items-center justify-center">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle
            cx="48" cy="48" r={r}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
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
          <span className="bg-[linear-gradient(180deg,#fad933,#efac40)] bg-clip-text text-[22px] font-extrabold leading-none text-transparent">
            {multiplier}
          </span>
          {capacity && (
            <span className="mt-0.5 text-[9px] font-medium text-black/45">{capacity}</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-black/35">算力倍數</span>
          <span className="h-px flex-1 bg-black/8" />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 items-center justify-center rounded-[10px] border border-[#fbd005]/25 bg-[#fbd005]/10 px-4">
            <span className="text-[18px] font-extrabold text-[#d7ab1e]">{level}</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-black/35">等級</p>
            <p className="text-[12px] font-medium text-black/70">Level {level}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────── Secondary badge ────────────────────── */

function SecondaryBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 items-center gap-2.5 rounded-[12px] border border-[#fbd005]/12 bg-[#fbd005]/8 px-3 py-2.5">
      <div className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#fbd005]/70" />
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wider text-black/35">{label}</p>
        <p className="mt-0.5 truncate text-[12px] font-semibold text-black/90">{value}</p>
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
