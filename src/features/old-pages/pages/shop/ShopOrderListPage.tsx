import { useState, useEffect } from 'react'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchGoldOrderList, fetchGoldProductConfirm } from '../../services/api'
import type { GoldOrderItem } from '../../services/types'
import type { AppPage, PageParams } from '../../../figma/types'

const statusColor: Record<number, string> = {
  1: 'bg-yellow-500/20 text-yellow-300',
  2: 'bg-blue-500/20 text-blue-300',
  3: 'bg-green-500/20 text-green-300',
}

type ShopOrderListPageProps = {
  groupId?: string
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function ShopOrderListPage({ groupId, onNavigate }: ShopOrderListPageProps) {
  const [orders, setOrders] = useState<GoldOrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params: Record<string, unknown> = {
      page: 1,
      page_size: 10,
      status: 0,
    }
    if (groupId) params.group_id = groupId

    fetchGoldOrderList(params).then(res => { setOrders(res.list); setLoading(false) }).catch(() => setLoading(false))
  }, [groupId])

  const handleConfirm = async (id: number) => {
    await fetchGoldProductConfirm({ id })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 3, status_text: '已完成' } : o))
  }

  return (
    <PageContainer>
      <PageNavBar title="我的订单" onBack={() => onNavigate('shop')} />
      <div className="space-y-3 px-4 py-4">
        <button
          type="button"
          onClick={() => onNavigate('orders')}
          className="flex w-full items-center justify-between rounded-[16px] border border-[#f6d36b]/15 bg-[linear-gradient(135deg,rgba(255,241,147,0.12)_0%,rgba(235,165,0,0.06)_45%,rgba(255,255,255,0.03)_100%)] px-4 py-3 text-left shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#fff0a8_0%,#f2b31c_100%)] text-black shadow-[0_8px_18px_rgba(242,179,28,0.28)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 7.75H20M7 4.75H17M6.25 12H12.75M6.25 15.75H10.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M5 5.5H19C20.1046 5.5 21 6.39543 21 7.5V17.5C21 18.6046 20.1046 19.5 19 19.5H5C3.89543 19.5 3 18.6046 3 17.5V7.5C3 6.39543 3.89543 5.5 5 5.5Z" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">前往待支付订单</span>
              <span className="text-xs text-white/45">快速查看并继续完成未支付订单</span>
            </div>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#ffe28a]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>

        {loading ? (
          <p className="py-20 text-center text-sm text-white/40">加载中...</p>
        ) : orders.length === 0 ? (
          <p className="py-20 text-center text-sm text-white/40">暂无订单</p>
        ) : orders.map(o => (
          <div key={o.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">{o.order_no}</span>
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColor[o.status] ?? 'bg-white/10 text-white/60'}`}>{o.status_text}</span>
            </div>
            <div className="mt-3 flex gap-3">
              <img src={o.goods_image} alt={o.goods_name} className="h-16 w-16 rounded-lg bg-white/10 object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{o.goods_name}</p>
                <p className="mt-1 text-xs text-white/50">重量: {o.weight} × {o.quantity}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-white/50">{o.created_at}</span>
                  <span className="text-sm font-bold text-amber-400">¥{o.total_amount}</span>
                </div>
              </div>
            </div>
            {o.status === 2 && (
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={() => handleConfirm(o.id)} className="rounded-lg bg-gradient-to-r from-yellow-300 to-amber-500 px-4 py-1.5 text-xs font-bold text-black">确认收货</button>
              </div>
            )}
            {o.logistics_no && <p className="mt-2 text-xs text-white/40">物流单号: {o.logistics_no}</p>}
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
