import { useEffect, useState } from 'react'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { AgreementPopup } from '../../components/AgreementPopup'
import { fetchProductDetail } from '../../services/api'
import type { GoldProductDetail } from '../../services/types'
import type { AppPage, PageParams } from '../../../figma/types'

type ShopDetailPageProps = {
  productId: string | number
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function ShopDetailPage({ productId, onNavigate }: ShopDetailPageProps) {
  const [product, setProduct] = useState<GoldProductDetail | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showAgreement, setShowAgreement] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const data = await fetchProductDetail({ id: Number(productId) })
        setProduct(data)
      } finally { setLoading(false) }
    })()
  }, [productId])

  const handleBuy = () => {
    if (!product) return
    if (!product.is_purchased) {
      setShowAgreement(true)
    } else {
      onNavigate('shopOrderConfirm', { state: { product, quantity } })
    }
  }

  const handleAgree = () => {
    setShowAgreement(false)
    onNavigate('shopOrderConfirm', { state: { product, quantity } })
  }

  if (loading || !product) {
    return (
      <PageContainer>
        <PageNavBar title="商品详情" onBack={() => onNavigate('shop')} />
        <div className="flex flex-col items-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-400/20 border-t-yellow-400" />
          <span className="mt-3 text-sm text-white/60">加载中...</span>
        </div>
      </PageContainer>
    )
  }

  const stock = product.stock
  const dec = () => setQuantity(q => Math.max(1, q - 1))
  const inc = () => setQuantity(q => Math.min(stock, q + 1))

  return (
    <PageContainer>
      <PageNavBar title="商品详情" onBack={() => onNavigate('shop')} />
      <GallerySection images={product.images} name={product.name} />
      <InfoSection product={product} />
      <SpecsSection specs={product.specs} />
      <ContentSection html={product.content} />
      <div className="h-24" />
      <BottomBar quantity={quantity} stock={stock} dec={dec} inc={inc} onBuy={handleBuy} />
      <AgreementPopup visible={showAgreement} onClose={() => setShowAgreement(false)} onConfirm={handleAgree} content={product.agreement} />
    </PageContainer>
  )
}

function GallerySection({ images, name }: { images?: string[]; name: string }) {
  const [idx, setIdx] = useState(0)
  const safeImages = Array.isArray(images)
    ? images.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : []
  const list = safeImages.length > 0 ? safeImages : ['/old-pages/shop/ring-cycle.png']
  const currentIdx = idx >= list.length ? 0 : idx
  return (
    <div className="relative mx-4 mt-3 overflow-hidden rounded-2xl border border-yellow-500/20 shadow-lg">
      <img src={list[currentIdx]} alt={name} className="h-80 w-full object-cover" />
      {list.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {list.map((_, i) => (
            <button key={i} type="button" onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === currentIdx ? 'w-5 bg-yellow-400' : 'w-1.5 bg-white/40'}`} />
          ))}
        </div>
      )}
    </div>
  )
}

function InfoSection({ product }: { product: GoldProductDetail }) {
  return (
    <div className="mx-4 mt-3 rounded-xl border border-yellow-500/20 bg-[#1e1e1e] p-4 shadow">
      <div className="flex items-baseline gap-1">
        <span className="text-sm text-yellow-400">$</span>
        <span className="text-2xl font-bold text-yellow-400">{product.price}</span>
      </div>
      <h2 className="mt-2 text-lg font-semibold text-white">{product.name}</h2>
      <div className="mt-3 flex gap-6 text-sm">
        <span className="text-white/50">库存 <span className="font-medium text-yellow-400">{product.stock}</span></span>
        <span className="text-white/50">已售 <span className="font-medium text-yellow-400">{product.sales}</span></span>
        <span className="text-white/50">重量 <span className="font-medium text-white">{product.weight}</span></span>
      </div>
    </div>
  )
}

function SpecsSection({ specs }: { specs?: { label: string; value: string }[] }) {
  const list = Array.isArray(specs) ? specs : []
  if (!list.length) return null
  return (
    <div className="mx-4 mt-3 rounded-xl border border-yellow-500/20 bg-[#1e1e1e] p-4 shadow">
      <h3 className="mb-3 text-base font-semibold text-yellow-400">规格参数</h3>
      <div className="space-y-2">
        {list.map(s => (
          <div key={s.label} className="flex justify-between text-sm">
            <span className="text-white/50">{s.label}</span>
            <span className="font-medium text-white">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContentSection({ html }: { html?: string }) {
  return (
    <div className="mx-4 mt-3 rounded-xl border border-yellow-500/20 bg-[#1e1e1e] p-4 shadow">
      <h3 className="mb-3 text-base font-semibold text-yellow-400">商品详情</h3>
      <div className="prose prose-invert prose-sm max-w-none text-white/80" dangerouslySetInnerHTML={{ __html: html ?? '' }} />
    </div>
  )
}

function BottomBar({ quantity, stock, dec, inc, onBuy }: { quantity: number; stock: number; dec: () => void; inc: () => void; onBuy: () => void }) {
  return (
    <div className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-between border-t border-yellow-500/20 bg-[#1e1e1e] px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.4)]">
      <div className="flex items-center overflow-hidden rounded-lg border border-yellow-500/30 bg-black/30">
        <button type="button" onClick={dec} disabled={quantity <= 1} className="flex h-10 w-10 items-center justify-center text-lg text-yellow-400 disabled:text-white/30">-</button>
        <span className="flex h-10 w-14 items-center justify-center border-x border-yellow-500/20 text-sm font-semibold text-white">{quantity}</span>
        <button type="button" onClick={inc} disabled={quantity >= stock} className="flex h-10 w-10 items-center justify-center text-lg text-yellow-400 disabled:text-white/30">+</button>
      </div>
      <button type="button" onClick={onBuy} disabled={stock <= 0}
        className="ml-4 flex-1 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-3 text-center text-base font-bold text-black shadow disabled:bg-white/20 disabled:text-white/50 disabled:shadow-none">
        立即购买
      </button>
    </div>
  )
}
