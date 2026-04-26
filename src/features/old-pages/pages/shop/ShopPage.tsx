import { useEffect, useState, useCallback } from 'react'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import {
  fetchMallBanner, fetchTodayGoldPrice, fetchCategoryList,
  fetchProductList, fetchMallBlock,
} from '../../services/api'
import type { BannerItem, GoldPrice, GoldCategory, GoldProduct, GroupItem } from '../../services/types'
import type { AppPage, PageParams } from '../../../figma/types'

type ShopPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function ShopPage({ onNavigate }: ShopPageProps) {
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null)
  const [categories, setCategories] = useState<GoldCategory[]>([])
  const [products, setProducts] = useState<GoldProduct[]>([])
  const [, setBlocks] = useState<GroupItem[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null)
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [b, gp, bl] = await Promise.all([fetchMallBanner(), fetchTodayGoldPrice(), fetchMallBlock()])
      setBanners(b); setGoldPrice(gp); setBlocks(bl)
      const blockId = bl.length > 0 ? bl[0].id : null
      setSelectedBlockId(blockId)
      const [cats, prods] = await Promise.all([fetchCategoryList(), fetchProductList()])
      setCategories(cats); setProducts(prods)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const selectCategory = (id: number) => {
    setSelectedCatId(prev => (prev === id ? null : id))
  }

  const filtered = selectedCatId ? products.filter(p => p.category_id === selectedCatId) : products

  return (
    <PageContainer>
      <PageNavBar title="商城" onBack={() => onNavigate('home')} />
      {/* Banner */}
      <BannerSection banners={banners} goldPrice={goldPrice} />
      {/* Quick actions */}
      <QuickActions onNavigate={onNavigate} blockId={selectedBlockId} />
      {/* Categories */}
      <CategoryTabs categories={categories} selectedId={selectedCatId} onSelect={selectCategory} />
      {/* Products */}
      {loading ? <LoadingSpinner /> : (
        filtered.length > 0
          ? <ProductGrid products={filtered} onTap={id => onNavigate('shopDetail', { id })} />
          : <EmptyState />
      )}
      <div className="h-20" />
    </PageContainer>
  )
}

function BannerSection({ banners, goldPrice }: { banners: BannerItem[]; goldPrice: GoldPrice | null }) {
  const src = banners[0]?.image || 'https://file.naaidepin.com/upload/images/c6135c4990ab6e4f1506d78c4eaa0ed8.png'
  return (
    <div className="relative mx-4 mt-3 overflow-hidden rounded-xl border border-yellow-500/20">
      <img src={src} alt="banner" className="h-40 w-full object-cover" />
      {goldPrice && (
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400/90 to-red-500/80 px-2.5 py-1 text-xs font-bold text-white shadow">
          <span>${goldPrice.price}</span>
          <span className={goldPrice.change.startsWith('+') ? 'text-green-200' : 'text-red-200'}>{goldPrice.change} ({goldPrice.change_rate})</span>
        </div>
      )}
    </div>
  )
}

function QuickActions({ onNavigate, blockId }: { onNavigate: (page: AppPage, params?: PageParams) => void; blockId: number | null }) {
  const qs = blockId ? String(blockId) : undefined
  return (
    <div className="mx-4 mt-4 space-y-3">
      {[
        { label: '我的订单', sub: '查看购买记录', page: 'shopOrderList' as AppPage },
        { label: '待释放记录', sub: '查看释放历史', page: 'shopOrderRelease' as AppPage },
      ].map(a => (
        <button key={a.page} type="button" onClick={() => onNavigate(a.page, { group_id: qs })}
          className="flex w-full items-center gap-3 rounded-2xl border border-yellow-500/20 bg-[#1e1e1e] p-3 text-left shadow-md transition active:scale-[0.98]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow">
            <svg className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V8h14v11zM7 10h10v2H7zm0 4h7v2H7z" /></svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">{a.label}</div>
            <div className="text-xs text-white/60">{a.sub}</div>
          </div>
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" /></svg>
        </button>
      ))}
    </div>
  )
}

function CategoryTabs({ categories, selectedId, onSelect }: { categories: GoldCategory[]; selectedId: number | null; onSelect: (id: number) => void }) {
  if (!categories.length) return null
  return (
    <div className="mx-4 mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map(c => (
        <button key={c.id} type="button" onClick={() => onSelect(c.id)}
          className={`flex shrink-0 flex-col items-center gap-1.5 rounded-xl border p-2 transition ${selectedId === c.id ? 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_12px_rgba(251,208,5,0.25)]' : 'border-yellow-500/20 bg-[#1e1e1e]'}`}>
          <img src={c.image} alt={c.name} className="h-10 w-10 object-contain" />
          <span className={`text-xs ${selectedId === c.id ? 'font-semibold text-yellow-400' : 'text-white'}`}>{c.name}</span>
        </button>
      ))}
    </div>
  )
}

function ProductGrid({ products, onTap }: { products: GoldProduct[]; onTap: (id: number) => void }) {
  return (
    <div className="mx-4 mt-5 grid grid-cols-2 gap-3">
      {products.map(p => (
        <button key={p.id} type="button" onClick={() => onTap(p.id)}
          className="overflow-hidden rounded-xl border border-yellow-500/20 bg-[#1e1e1e] text-left shadow transition active:scale-[0.97]">
          <div className="h-36 w-full bg-black/30">
            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
          </div>
          <div className="p-3">
            <div className="truncate text-sm font-semibold text-white">{p.name}</div>
            <div className="mt-1 text-xs text-white/60">库存 {p.stock} · {p.weight}</div>
            <div className="mt-1.5 text-base font-bold text-yellow-400">{p.price} <span className="text-xs font-medium">USDT</span></div>
          </div>
        </button>
      ))}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-400/20 border-t-yellow-400" />
      <span className="mt-3 text-sm text-white/60">加载中...</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mx-4 mt-8 flex flex-col items-center rounded-2xl border border-yellow-500/20 bg-[#1e1e1e] py-16">
      <svg className="h-20 w-20 text-yellow-400/60" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="3"><path d="M50 60L160 60L150 140L60 140Z" strokeLinejoin="round" /><circle cx="75" cy="155" r="8" /><circle cx="135" cy="155" r="8" /></svg>
      <span className="mt-4 text-base font-semibold text-white">暂无商品</span>
      <span className="mt-1 text-sm text-white/50">换个分类看看吧</span>
    </div>
  )
}
