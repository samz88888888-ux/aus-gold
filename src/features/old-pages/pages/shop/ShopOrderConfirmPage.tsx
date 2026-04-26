import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchAddressList } from '../../services/api'
import type { GoldProductDetail, AddressItem } from '../../services/types'

type LocationState = { product: GoldProductDetail; quantity: number }

export function ShopOrderConfirmPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const product = state?.product
  const initQty = state?.quantity ?? 1

  const [quantity, setQuantity] = useState(initQty)
  const [needDelivery, setNeedDelivery] = useState(true)
  const [remark, setRemark] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    fetchAddressList().then(list => {
      const addrId = searchParams.get('address_id')
      if (addrId) {
        const found = list.find(a => a.id === Number(addrId))
        if (found) { setSelectedAddress(found); return }
      }
      const def = list.find(a => a.is_default === 1) ?? list[0] ?? null
      setSelectedAddress(def)
    })
  }, [searchParams])

  if (!product) {
    return (
      <PageContainer>
        <PageNavBar title="确认订单" />
        <div className="flex flex-col items-center py-32 text-white/60">
          <span>订单数据不存在</span>
          <button type="button" onClick={() => navigate('/shop')} className="mt-4 rounded-lg bg-yellow-400/20 px-6 py-2 text-sm text-yellow-400">返回商城</button>
        </div>
      </PageContainer>
    )
  }

  const price = parseFloat(product.price.replace(/,/g, '') || '0')
  const total = (price * quantity).toFixed(2)

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    setSubmitting(false)
    navigate('/orders')
  }

  return (
    <PageContainer>
      <PageNavBar title="确认订单" />
      <div className="px-4 pb-40 pt-4">
        <DeliveryToggle active={needDelivery} onChange={setNeedDelivery} />
        {needDelivery && <AddressCard address={selectedAddress} onSelect={() => navigate('/address?from=shop/orderConfirm')} />}
        <ProductCard product={product} quantity={quantity} setQuantity={setQuantity} />
        <RemarkSection value={remark} onChange={setRemark} />
      </div>
      <div className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-between border-t border-yellow-500/20 bg-[#1e1e1e] px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.4)]">
        <div>
          <div className="text-xs text-white/60">商品金额</div>
          <div className="text-xl font-bold text-yellow-400">{total} <span className="text-xs font-medium">USDT</span></div>
        </div>
        <button type="button" onClick={handleSubmit} disabled={submitting}
          className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-3 text-base font-bold text-black shadow disabled:opacity-50">
          {submitting ? '提交中...' : '确认下单 →'}
        </button>
      </div>
    </PageContainer>
  )
}

function DeliveryToggle({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="mb-4 grid grid-cols-2 overflow-hidden rounded-xl border border-yellow-500/20 bg-[#1e1e1e] shadow">
      {[true, false].map(v => (
        <button key={String(v)} type="button" onClick={() => onChange(v)}
          className={`py-3 text-sm font-medium transition ${active === v ? 'bg-gradient-to-br from-yellow-400 to-amber-500 font-semibold text-black' : 'text-white/60'}`}>
          {v ? '需要发货' : '无需发货'}
        </button>
      ))}
    </div>
  )
}

function AddressCard({ address, onSelect }: { address: AddressItem | null; onSelect: () => void }) {
  if (!address) {
    return (
      <button type="button" onClick={onSelect}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-yellow-500/30 bg-[#1e1e1e] p-4 text-sm text-yellow-400/70">
        <span>+ 选择收货地址</span>
      </button>
    )
  }
  return (
    <button type="button" onClick={onSelect}
      className="mb-4 flex w-full items-center gap-3 rounded-xl border border-yellow-500/20 bg-[#1e1e1e] p-4 text-left shadow">
      <span className="text-lg">📍</span>
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

function ProductCard({ product, quantity, setQuantity }: { product: GoldProductDetail; quantity: number; setQuantity: (q: number) => void }) {
  return (
    <div className="mb-4 flex gap-3 rounded-xl border border-yellow-500/20 bg-[#1e1e1e] p-4 shadow">
      <img src={product.image} alt={product.name} className="h-20 w-20 shrink-0 rounded-xl border border-yellow-500/20 bg-black/30 object-cover" />
      <div className="flex flex-1 flex-col justify-between">
        <div className="text-sm font-semibold text-white">{product.name}</div>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-yellow-400">{product.price} <span className="text-xs font-medium">USDT</span></span>
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-400/10 px-2 py-1">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-sm text-yellow-400">-</button>
            <span className="w-6 text-center text-sm font-semibold text-yellow-400">{quantity}</span>
            <button type="button" onClick={() => setQuantity(quantity + 1)} className="text-sm text-yellow-400">+</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RemarkSection({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-xl border border-yellow-500/20 bg-[#1e1e1e] p-4 shadow">
      <div className="mb-2 text-sm font-semibold text-yellow-400">备注信息</div>
      <textarea value={value} onChange={e => onChange(e.target.value)} maxLength={200} placeholder="选填，请输入备注信息"
        className="h-20 w-full resize-none rounded-lg border border-yellow-500/20 bg-black/30 p-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-yellow-500/40" />
    </div>
  )
}
