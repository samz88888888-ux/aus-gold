import { useEffect, useMemo, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
import { AgreementPopup } from '../../components/AgreementPopup'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchProductDetail } from '../../services/api'
import { saveShopOrderDraft } from '../../services/shopOrderDraft'
import type { GoldProductDetail, GoldSkuInfo, ShopOrderDraft } from '../../services/types'

type ShopDetailPageProps = {
  productId: string | number
  onNavigate: (page: AppPage, params?: PageParams) => void
}

function toNumber(value: number | string | undefined) {
  return Number(String(value ?? '0').replace(/,/g, '')) || 0
}

export function ShopDetailPage({ productId, onNavigate }: ShopDetailPageProps) {
  const [product, setProduct] = useState<GoldProductDetail | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedSkuValue, setSelectedSkuValue] = useState<string | null>(null)
  const [showAgreement, setShowAgreement] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoading(true)
      try {
        const data = await fetchProductDetail({ id: Number(productId) })
        if (cancelled) return
        setProduct(data)
        if (data.is_sku === 2 && data.sku_attr_value) {
          const firstAvailable = Object.entries(data.sku_attr_value).find(([, item]) => Number(item.stock || 0) > 0)
          setSelectedSkuValue(firstAvailable?.[0] ?? Object.keys(data.sku_attr_value)[0] ?? null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [productId])

  const currentSkuInfo = useMemo<GoldSkuInfo | null>(() => {
    if (!product?.sku_attr_value || !selectedSkuValue) return null
    return product.sku_attr_value[selectedSkuValue] ?? null
  }, [product?.sku_attr_value, selectedSkuValue])

  const currentPrice = currentSkuInfo ? toNumber(currentSkuInfo.price) : toNumber(product?.price)
  const currentStock = currentSkuInfo ? Number(currentSkuInfo.stock || 0) : Number(product?.stock || 0)
  const handicraftFee = toNumber(product?.handicraft_fee)
  const totalPrice = (currentPrice + handicraftFee).toFixed(2)
  const canPurchase = Boolean(product) && currentStock > 0 && quantity <= currentStock && Boolean(product?.is_sku !== 2 || selectedSkuValue)

  const proceedToOrder = () => {
    if (!product) return

    const draft: ShopOrderDraft = {
      product: {
        id: product.id,
        name: product.name,
        img: product.img || product.image,
        payment: product.payment,
        no_payment: product.no_payment,
        handicraft_fee: product.handicraft_fee,
      },
      quantity,
      selectedSkuValue,
      skuInfo: currentSkuInfo,
      price: currentPrice,
      totalPrice,
    }

    saveShopOrderDraft(draft)
    onNavigate('shopOrderConfirm', { state: draft })
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

  const images = product.images.length > 0
    ? product.images
    : (product.slider_img && product.slider_img.length > 0 ? product.slider_img : [product.img || product.image])

  return (
    <PageContainer>
      <PageNavBar title="商品详情" onBack={() => onNavigate('shop')} />
      <GallerySection images={images} name={product.name} />
      <InfoSection product={product} currentPrice={currentPrice} currentStock={currentStock} />
      {product.is_sku === 2 && product.sku_attr_value ? (
        <SkuSection
          skuMap={product.sku_attr_value}
          selectedSkuValue={selectedSkuValue}
          onSelect={(value, skuInfo) => {
            if (Number(skuInfo.stock || 0) <= 0) return
            setSelectedSkuValue(value)
            setQuantity(1)
          }}
        />
      ) : null}
      <ContentSection html={product.content} />
      <div className="h-40" />
      <BottomBar
        quantity={quantity}
        stock={currentStock}
        currentPrice={currentPrice}
        handicraftFee={handicraftFee}
        totalPrice={totalPrice}
        canBuy={canPurchase}
        onDecrease={() => setQuantity((value) => Math.max(1, value - 1))}
        onIncrease={() => setQuantity((value) => Math.min(currentStock, value + 1))}
        onBuy={() => setShowAgreement(true)}
      />
      <AgreementPopup
        visible={showAgreement}
        onClose={() => setShowAgreement(false)}
        onConfirm={() => {
          setShowAgreement(false)
          proceedToOrder()
        }}
        content={product.agreement}
      />
    </PageContainer>
  )
}

function GallerySection({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0)
  const currentIdx = idx >= images.length ? 0 : idx

  return (
    <div className="relative mx-4 mt-3 overflow-hidden rounded-2xl border border-yellow-500/20 shadow-lg">
      <img src={images[currentIdx]} alt={name} className="h-80 w-full object-cover" />
      {images.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setIdx(index)}
              className={`h-1.5 rounded-full transition-all ${index === currentIdx ? 'w-5 bg-yellow-400' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function InfoSection({
  product,
  currentPrice,
  currentStock,
}: {
  product: GoldProductDetail
  currentPrice: number
  currentStock: number
}) {
  return (
    <div className="mx-4 mt-3 rounded-xl border border-yellow-500/20 bg-[#1e1e1e] p-4 shadow">
      <div className="flex items-baseline gap-1">
        <span className="text-sm text-yellow-400">$</span>
        <span className="text-2xl font-bold text-yellow-400">{currentPrice.toFixed(2)}</span>
      </div>
      <h2 className="mt-2 text-lg font-semibold text-white">{product.name}</h2>
      <div className="mt-3 flex gap-6 text-sm">
        <span className="text-white/50">库存 <span className="font-medium text-yellow-400">{currentStock}</span></span>
        <span className="text-white/50">已售 <span className="font-medium text-yellow-400">{product.sales}</span></span>
        <span className="text-white/50">工费 <span className="font-medium text-white">{toNumber(product.handicraft_fee).toFixed(2)}</span></span>
      </div>
    </div>
  )
}

function SkuSection({
  skuMap,
  selectedSkuValue,
  onSelect,
}: {
  skuMap: Record<string, GoldSkuInfo>
  selectedSkuValue: string | null
  onSelect: (value: string, skuInfo: GoldSkuInfo) => void
}) {
  return (
    <div className="mx-4 mt-3 rounded-xl border border-yellow-500/20 bg-[#1e1e1e] p-4 shadow">
      <h3 className="mb-3 text-base font-semibold text-yellow-400">规格选择</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(skuMap).map(([value, skuInfo]) => {
          const active = selectedSkuValue === value
          const disabled = Number(skuInfo.stock || 0) <= 0
          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(value, skuInfo)}
              className={`rounded-xl border px-3 py-2 text-sm ${active ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-white/10 text-white/70'} ${disabled ? 'opacity-30' : ''}`}
            >
              {value}
            </button>
          )
        })}
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

function BottomBar({
  quantity,
  stock,
  currentPrice,
  handicraftFee,
  totalPrice,
  canBuy,
  onDecrease,
  onIncrease,
  onBuy,
}: {
  quantity: number
  stock: number
  currentPrice: number
  handicraftFee: number
  totalPrice: string
  canBuy: boolean
  onDecrease: () => void
  onIncrease: () => void
  onBuy: () => void
}) {
  return (
    <div className="fixed bottom-[76px] left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-white/10 bg-[#0a0a1a]/95 px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.4)] backdrop-blur">
      <div className="mb-3 flex items-center justify-between rounded-2xl border border-yellow-500/15 bg-white/[0.04] px-3.5 py-2.5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-yellow-400/70">Order Summary</p>
          <p className="mt-1 text-[15px] font-bold text-yellow-400">
            {totalPrice}
            <span className="ml-1 text-[11px] font-medium text-yellow-200/75">USDT</span>
          </p>
        </div>
        <div className="text-right text-[11px] leading-5 text-white/50">
          <p>商品价 {currentPrice.toFixed(2)}</p>
          <p>工时费 {handicraftFee.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex shrink-0 items-center overflow-hidden rounded-xl border border-yellow-500/25 bg-black/30">
          <button type="button" onClick={onDecrease} disabled={quantity <= 1} className="flex h-11 w-11 items-center justify-center text-lg text-yellow-400 disabled:text-white/30">-</button>
          <span className="flex h-11 w-14 items-center justify-center border-x border-yellow-500/15 text-sm font-semibold text-white">{quantity}</span>
          <button type="button" onClick={onIncrease} disabled={quantity >= stock} className="flex h-11 w-11 items-center justify-center text-lg text-yellow-400 disabled:text-white/30">+</button>
        </div>

        <button
          type="button"
          onClick={onBuy}
          disabled={!canBuy}
          className="flex h-11 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 text-center text-base font-bold text-black shadow disabled:bg-white/20 disabled:text-white/50 disabled:shadow-none"
        >
          立即购买
        </button>
      </div>
    </div>
  )
}
