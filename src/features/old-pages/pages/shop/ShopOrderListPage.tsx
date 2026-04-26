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
