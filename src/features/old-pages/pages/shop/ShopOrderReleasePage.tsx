import { useEffect, useState, useCallback } from 'react'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchOrderReleaseList } from '../../services/api'
import type { OrderReleaseItem } from '../../services/types'
import type { AppPage, PageParams } from '../../../figma/types'

type ShopOrderReleasePageProps = {
  groupId?: string
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function ShopOrderReleasePage({ groupId, onNavigate }: ShopOrderReleasePageProps) {
  const [records, setRecords] = useState<OrderReleaseItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page: 1, page_size: 20 }
      if (groupId) params.group_id = groupId
      const res = await fetchOrderReleaseList(params)
      setRecords(res.list)
    } finally { setLoading(false) }
  }, [groupId])

  useEffect(() => { load() }, [load])

  return (
    <PageContainer>
      <PageNavBar title="待释放记录" onBack={() => onNavigate('shop')} />
      <div className="px-4 pb-20 pt-4">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-400/20 border-t-yellow-400" />
            <span className="mt-3 text-sm text-white/60">加载中...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <span className="text-base font-semibold text-white">暂无释放记录</span>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(r => <ReleaseCard key={r.id} item={r} />)}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

function ReleaseCard({ item }: { item: OrderReleaseItem }) {
  const isReleased = item.status === 'released'
  const badgeClass = isReleased
    ? 'border-green-500/40 bg-green-500/15 text-green-400'
    : 'border-yellow-500/40 bg-yellow-500/15 text-yellow-400'

  return (
    <div className="rounded-xl border border-yellow-500/20 bg-[#1e1e1e] p-3 shadow">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-white/50">{item.order_no}</span>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}>{item.status_text}</span>
      </div>
      <div className="text-sm font-semibold text-white">{item.goods_name}</div>
      <div className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-yellow-500/10">
        <div className="flex flex-col items-center bg-black/30 py-2.5">
          <span className="text-[10px] text-white/60">释放金额</span>
          <span className="mt-1 text-sm font-bold text-yellow-400">{item.release_amount}</span>
        </div>
        <div className="flex flex-col items-center bg-black/30 py-2.5">
          <span className="text-[10px] text-white/60">释放日期</span>
          <span className="mt-1 text-sm font-bold text-white">{item.release_date}</span>
        </div>
      </div>
    </div>
  )
}
