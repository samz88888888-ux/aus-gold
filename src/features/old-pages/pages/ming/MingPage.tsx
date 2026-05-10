import { type ReactNode, useEffect, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
import { NoticePopup } from '../../components/NoticePopup'
import { DestroyAmountModal, type DestroyAmountSubmitPayload } from '../../components/payment/DestroyAmountModal'
import { PreOrderPaymentMethodModal } from '../../components/payment/PreOrderPaymentMethodModal'
import { PageContainer } from '../../components/PageContainer'
import { useOldPagesCopy } from '../../i18n'
import { createPreOrder, fetchDestoryInfo, fetchUserInfoOld } from '../../services/api'
import type { DestoryInfo, PaymentMethod, UserInfo } from '../../services/types'

function fmt(value: number | string | undefined) {
  if (!value && value !== 0) return '0.00'
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function fmtPrice(value: number | string | undefined) {
  if (!value && value !== 0) return '0.0000'
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  })
}

type MingPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function MingPage({ onNavigate }: MingPageProps) {
  const copy = useOldPagesCopy()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [destoryInfo, setDestoryInfo] = useState<DestoryInfo | null>(null)
  const [showAmountModal, setShowAmountModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [destroyAmount, setDestroyAmount] = useState(0)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<{
    title?: string
    message: string
    confirmText?: string
    onConfirm?: () => void
  } | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.allSettled([fetchUserInfoOld(), fetchDestoryInfo()]).then(([userResult, destroyResult]) => {
      if (cancelled) return

      if (userResult.status === 'fulfilled') {
        setUserInfo(userResult.value)
      }

      if (destroyResult.status === 'fulfilled') {
        setDestoryInfo(destroyResult.value)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const totalPower = fmt(userInfo?.power)
  // const lockedPower = fmt(userInfo?.valid_user_power)

  const handleDestroySubmit = async (payload: DestroyAmountSubmitPayload) => {
    try {
      const latestInfo = await fetchDestoryInfo()
      setDestoryInfo(latestInfo)

      if (Number(payload.amount) < Number(latestInfo.min_amount)) {
        setNotice({
          message: `${copy.destroyMinAmount} ${Number(latestInfo.min_amount).toFixed(2)} USDC`,
        })
        return
      }

      const nextMethods = payload.paymentType === 'naau' ? latestInfo.naau_payment : latestInfo.payment
      if (!nextMethods || nextMethods.length === 0) {
        setNotice({ message: copy.noPaymentMethods })
        return
      }

      setDestroyAmount(Number(payload.amount))
      setPaymentMethods(nextMethods)
      setShowAmountModal(false)
      setShowPaymentModal(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.fetchPaymentMethodsFailed
      setNotice({ message })
    }
  }

  const handleCreateDestroyOrder = async (method: PaymentMethod) => {
    if (submitting) return

    try {
      setSubmitting(true)
      await createPreOrder({
        order_type: 'destroy_machine',
        payment_id: Number(method.id),
        source_extend: {
          amount: destroyAmount,
        },
      })

      setShowPaymentModal(false)
      setNotice({
        message: copy.orderCreated,
        confirmText: copy.goToOrders,
        onConfirm: () => {
          setNotice(null)
          onNavigate('orders')
        },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.createDestroyOrderFailed
      setNotice({ message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer bgClass="bg-[#040404]">
      <div className="relative overflow-hidden px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-4 text-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(251,208,5,0.26),rgba(251,208,5,0.05)_42%,transparent_72%)]" />
        <div className="pointer-events-none absolute right-[-60px] top-[110px] h-[220px] w-[220px] rounded-full bg-[#f7b500]/12 blur-[80px]" />
        <div className="pointer-events-none absolute left-[-90px] top-[280px] h-[240px] w-[240px] rounded-full bg-[#266dff]/10 blur-[100px]" />

        <section className="relative overflow-hidden rounded-[30px] border border-[#f7c931]/18 bg-[#080808] shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          <div
            className="absolute inset-0 opacity-80"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(3,3,3,0.94) 10%, rgba(3,3,3,0.72) 48%, rgba(3,3,3,0.28) 100%), url('/old-pages/ming/ming-index-gb.png')",
              backgroundPosition: 'center top',
              backgroundSize: 'cover',
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.55))]" />

          <div className="relative px-5 pb-5 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f6c640]">
                  Mining Center
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <img
                    src="/old-pages/ming/ming-power-light.png"
                    alt=""
                    className="h-4 w-4"
                  />
                  <span className="text-[13px] font-medium text-white/72">
                    {copy.cumulativePower}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('mingLog')}
                className="inline-flex h-9 items-center rounded-full border border-[#f7c931]/25 bg-black/45 px-3.5 text-[11px] font-semibold text-white shadow-[0_8px_18px_rgba(0,0,0,0.28)] backdrop-blur"
              >
                {copy.miningLog}
              </button>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[42px] font-black leading-none tracking-[-0.04em] text-white">
                  {totalPower}
                </p>
                {/* <div className="mt-4 inline-flex items-center rounded-full bg-[linear-gradient(135deg,#ffec92_0%,#fbd005_55%,#d79712_100%)] px-3.5 py-1.5 shadow-[0_10px_24px_rgba(251,208,5,0.24)]">
                  <span className="text-[12px] font-black tracking-[0.02em] text-[#251600]">鎖倉算力：{lockedPower}</span>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        <section className="relative mt-5 overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,18,18,0.98),rgba(8,8,8,0.98))] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.34)]">
          <div className="absolute left-0 right-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(251,208,5,0.5),transparent)]" />

          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f6c640]">
                Mining Engine
              </p>
              <h2 className="mt-1 text-[22px] font-black text-white">
                {copy.coreMiningZone}
              </h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-white/48">
              {copy.livePreview}
            </div>
          </div>

          <div className="overflow-hidden rounded-[26px] border border-[#f7c931]/15 bg-black/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="aspect-[5/4] w-full">
              <img
                src="https://bridge-coin.s3.ap-east-1.amazonaws.com/ming.gif"
                alt="mining preview"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="mt-4 rounded-[20px] border border-[#f8cf48]/14 bg-[linear-gradient(145deg,rgba(248,207,72,0.09),rgba(255,255,255,0.025)_42%,rgba(255,255,255,0.04))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">
                {copy.destroyMinAmount}
              </span>
              <span className="shrink-0 text-[15px] font-black text-white">
                {fmt(destoryInfo?.min_amount)} USDC
              </span>
            </div>
            <div className="pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f8cf48]/75">
                {copy.currentPrice}
              </p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <span className="shrink-0 text-[18px] font-black leading-none text-white">1 AUS</span>
                <span className="text-[16px] font-black leading-none text-[#f8cf48]">≈</span>
                <span className="min-w-0 flex-1 text-right text-[28px] font-black leading-none text-white tracking-[-0.03em]">
                  {fmtPrice(destoryInfo?.aus_price)}
                </span>
                <span className="shrink-0 pb-0.5 text-[12px] font-bold leading-none text-white/72">USDC</span>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mt-5 overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,18,18,0.98),rgba(8,8,8,0.98))] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.34)]">
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(251,208,5,0.45),transparent)]" />
          <div className="pointer-events-none absolute right-[-40px] top-[-28px] h-32 w-32 rounded-full bg-[#f8cf48]/12 blur-3xl" />

          <div className="relative flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f6c640]">
                Quick Access
              </p>
              <h2 className="mt-1 text-[20px] font-black text-white">
                {copy.quickAction}
              </h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-white/48">
              {copy.quickAccess}
            </div>
          </div>

          <div className="relative mt-4">
            <ActionButton
              className="w-full"
              variant="primary"
              icon={<ArrowBadgeIcon />}
              label={copy.destroyMining}
              description={copy.destroyMiningDescription}
              badge={`${copy.destroyMinAmount} ${fmt(destoryInfo?.min_amount)} USDC`}
              actionText={copy.confirmDestroy}
              onClick={() => setShowAmountModal(true)}
            />
          </div>
        </section>
      </div>

      <DestroyAmountModal
        visible={showAmountModal}
        minAmount={Number(destoryInfo?.min_amount ?? 0)}
        price={Number(destoryInfo?.price ?? 0)}
        naauPrice={Number(destoryInfo?.naau_price ?? 0)}
        currencyName={destoryInfo?.currency?.name || 'NADI'}
        showNaauTab={Boolean(destoryInfo?.naau_payment?.length)}
        onClose={() => setShowAmountModal(false)}
        onSubmit={handleDestroySubmit}
      />

      <PreOrderPaymentMethodModal
        visible={showPaymentModal}
        title={submitting ? copy.createOrderLoading : copy.choosePaymentMethod}
        orderAmount={destroyAmount}
        paymentMethods={paymentMethods}
        onClose={() => {
          if (submitting) return
          setShowPaymentModal(false)
        }}
        onConfirm={handleCreateDestroyOrder}
      />

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

function ActionButton({
  className,
  variant = 'secondary',
  icon,
  label,
  description,
  badge,
  actionText,
  onClick,
}: {
  className?: string
  variant?: 'primary' | 'secondary'
  icon: ReactNode
  label: string
  description: string
  badge?: string
  actionText: string
  onClick: () => void
}) {
  const primary = variant === 'primary'

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group relative overflow-hidden rounded-[22px] border px-4 py-4 text-left text-white shadow-[0_16px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] transition-transform active:scale-[0.98]',
        primary
          ? 'border-[#f6c640]/28 bg-[linear-gradient(150deg,rgba(55,41,7,0.98)_0%,rgba(25,20,7,0.98)_42%,rgba(10,10,10,0.98)_100%)]'
          : 'border-white/10 bg-[linear-gradient(165deg,rgba(29,29,29,0.98)_0%,rgba(10,10,10,0.98)_100%)]',
        className ?? '',
      ].join(' ')}
    >
      <div className={`absolute right-[-16px] top-[-20px] h-24 w-24 rounded-full blur-2xl ${primary ? 'bg-[#f8cf48]/18' : 'bg-[#f8cf48]/8'}`} />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start gap-2.5">
          {icon}
          <div className="min-w-0 flex-1">
            <p className={`truncate whitespace-nowrap text-[15px] font-black leading-none ${primary ? 'text-[#ffe08a]' : 'text-[#f8cf48]'}`}>{label}</p>
            <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-white/62">{description}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${primary ? 'bg-[#f8cf48]/12 text-[#ffe08a]' : 'bg-white/8 text-white/60'}`}>
            {badge}
          </span>
          <div className={`inline-flex items-center gap-2 text-[11px] font-semibold ${primary ? 'text-[#ffe08a]' : 'text-white/52'}`}>
            {actionText}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  )
}

function ArrowBadgeIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f8cf48]/35 bg-[#f8cf48]/12 text-[#f8cf48] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5" />
        <path d="m6 11 6-6 6 6" />
      </svg>
    </span>
  )
}
