import { useEffect, useMemo, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
import { NoticePopup } from '../../components/NoticePopup'
import { PreOrderPaymentMethodModal } from '../../components/payment/PreOrderPaymentMethodModal'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { createPreOrder, fetchAddressList } from '../../services/api'
import { clearShopOrderDraft, getShopOrderDraft } from '../../services/shopOrderDraft'
import type { AddressItem, PaymentMethod, ShopOrderDraft } from '../../services/types'

type ShopOrderConfirmPageProps = {
  pageState?: ShopOrderDraft | null
  addressId?: string
  onNavigate: (page: AppPage, params?: PageParams) => void
}

function getDraft(pageState?: ShopOrderDraft | null) {
  return pageState ?? getShopOrderDraft()
}

export function ShopOrderConfirmPage({ pageState, addressId, onNavigate }: ShopOrderConfirmPageProps) {
  const [draft] = useState<ShopOrderDraft | null>(() => getDraft(pageState))
  const [remark, setRemark] = useState('')
  const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPaymentPopup, setShowPaymentPopup] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [notice, setNotice] = useState<{
    title?: string
    message: string
    confirmText?: string
    onConfirm?: () => void
  } | null>(null)
  const needDelivery = true

  useEffect(() => {
    let cancelled = false

    fetchAddressList()
      .then((list) => {
        if (cancelled) return
        if (addressId) {
          const found = list.find((item) => item.id === Number(addressId))
          if (found) {
            setSelectedAddress(found)
            return
          }
        }
        const nextDefault = list.find((item) => item.is_default === 1) ?? list[0] ?? null
        setSelectedAddress(nextDefault)
      })
      .catch(() => {
        if (!cancelled) setSelectedAddress(null)
      })

    return () => {
      cancelled = true
    }
  }, [addressId])

  const canSubmit = useMemo(() => {
    if (!draft) return false
    if (needDelivery && !selectedAddress) return false
    return !submitting
  }, [draft, needDelivery, selectedAddress, submitting])

  if (!draft) {
    return (
      <PageContainer>
        <PageNavBar title="确认订单" onBack={() => onNavigate('shop')} />
        <div className="flex flex-col items-center py-32 text-white/60">
          <span>订单数据不存在</span>
          <button type="button" onClick={() => onNavigate('shop')} className="mt-4 rounded-lg bg-yellow-400/20 px-6 py-2 text-sm text-yellow-400">返回商城</button>
        </div>
      </PageContainer>
    )
  }

  const handleSubmit = () => {
    if (needDelivery && !selectedAddress) {
      setNotice({ message: '请选择收货地址' })
      return
    }

    const methods = needDelivery ? draft.product.payment : draft.product.no_payment
    if (!methods || methods.length === 0) {
      setNotice({ message: '暂无可用支付方式' })
      return
    }

    setPaymentMethods(methods)
    setShowPaymentPopup(true)
  }

  const handleCreateGoldOrder = async (method: PaymentMethod) => {
    if (submitting) return

    try {
      setSubmitting(true)
      await createPreOrder({
        order_type: 'gold_goods',
        payment_id: Number(method.id),
        source_extend: {
          goods_id: draft.product.id,
          count: draft.quantity,
          address_id: needDelivery ? selectedAddress?.id ?? null : null,
          sku_unique_id: draft.skuInfo?.unique ?? null,
          remark: remark.trim(),
          order_type: needDelivery ? 1 : 2,
        },
      })

      clearShopOrderDraft()
      setShowPaymentPopup(false)
      setNotice({
        message: '下单成功，请前往待支付订单完成支付',
        confirmText: '前往订单',
        onConfirm: () => {
          setNotice(null)
          onNavigate('orders')
        },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建订单失败'
      setNotice({ message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <PageNavBar title="确认订单" onBack={() => onNavigate('shop')} />
      <div className="px-4 pb-52 pt-4">
        {needDelivery ? (
          <AddressCard address={selectedAddress} onSelect={() => onNavigate('address', { from: 'shopOrderConfirm' })} />
        ) : null}
        <ProductCard draft={draft} />
        <RemarkSection value={remark} onChange={setRemark} />
      </div>

      <div className="fixed bottom-[62px] left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-between border-t border-white/10 bg-[#0a0a1a]/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.4)] backdrop-blur">
        <div>
          <div className="text-xs text-white/60">商品金额</div>
          <div className="text-xl font-bold text-yellow-400">{draft.totalPrice} <span className="text-xs font-medium">USDT</span></div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-3 text-base font-bold text-black shadow disabled:opacity-50"
        >
          {submitting ? '提交中...' : '立即支付 →'}
        </button>
      </div>

      <PreOrderPaymentMethodModal
        visible={showPaymentPopup}
        orderAmount={draft.totalPrice}
        paymentMethods={paymentMethods}
        title={submitting ? '正在创建订单...' : '选择支付方式'}
        onClose={() => {
          if (submitting) return
          setShowPaymentPopup(false)
        }}
        onConfirm={handleCreateGoldOrder}
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

function AddressCard({ address, onSelect }: { address: AddressItem | null; onSelect: () => void }) {
  if (!address) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-yellow-500/30 bg-[#1e1e1e] p-4 text-sm text-yellow-400/70"
      >
        <span>+ 选择收货地址</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="mb-4 flex w-full items-center gap-3 rounded-xl border border-yellow-500/20 bg-[#1e1e1e] p-4 text-left shadow"
    >
      <img src="/old-pages/shop/location.png" alt="" className="h-6 w-6 shrink-0" />
      <div className="flex-1">
        <div className="flex gap-4 text-sm">
          <span className="font-semibold text-white">{address.real_name}</span>
          <span className="text-white/60">{address.phone}</span>
        </div>
        <div className="mt-1 text-xs text-white/70">{address.province}{address.city}{address.district}{address.address}</div>
      </div>
      <svg className="h-4 w-4 text-yellow-400/60" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" /></svg>
    </button>
  )
}

function ProductCard({ draft }: { draft: ShopOrderDraft }) {
  return (
    <div className="mb-4 flex gap-3 rounded-xl border border-yellow-500/20 bg-[#1e1e1e] p-4 shadow">
      <img src={draft.product.img} alt={draft.product.name} className="h-20 w-20 shrink-0 rounded-xl border border-yellow-500/20 bg-black/30 object-cover" />
      <div className="flex flex-1 flex-col justify-between">
        <div className="text-sm font-semibold text-white">{draft.product.name}</div>
        <div className="text-xs text-white/55">{draft.selectedSkuValue || '默认规格'}</div>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-yellow-400">{Number(draft.price).toFixed(2)} <span className="text-xs font-medium">USDT</span></span>
          <div className="text-sm text-white/60">x{draft.quantity}</div>
        </div>
      </div>
    </div>
  )
}

function RemarkSection({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="rounded-xl border border-yellow-500/20 bg-[#1e1e1e] p-4 shadow">
      <div className="mb-2 text-sm font-semibold text-yellow-400">备注信息</div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={200}
        placeholder="选填，请输入备注信息"
        className="h-20 w-full resize-none rounded-lg border border-yellow-500/20 bg-black/30 p-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-yellow-500/40"
      />
    </div>
  )
}
