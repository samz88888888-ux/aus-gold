import { useState, useEffect } from 'react'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchMachineList } from '../../services/api'
import type { MachineItem } from '../../services/types'

const TAB_LIST = [
  { text: '激活设备', type: 1 },
  { text: '销毁矿机', type: 2 },
  { text: '联合矿机', type: 4 },
  { text: '节点矿机', type: 3 },
]

export function DestoryListPage() {
  const [activeTab, setActiveTab] = useState(2)
  const [list, setList] = useState<MachineItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const tab = TAB_LIST.find(t => t.type === activeTab)
    if (!tab) return
    setLoading(true)
    fetchMachineList({ page: 1, page_size: 50, machine_type: tab.type })
      .then(data => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [activeTab])

  return (
    <PageContainer bgClass="bg-[#050510]">
      <PageNavBar title="我的矿机" />

      <div className="min-h-screen px-4 pt-4"
        style={{ backgroundImage: "url('/old-pages/ming/ming-list-bg.png')", backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}>

        {/* Tab 切换 */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {TAB_LIST.map(tab => (
            <button
              key={tab.type}
              type="button"
              onClick={() => setActiveTab(tab.type)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.type
                  ? 'bg-amber-500 text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              {tab.text}
            </button>
          ))}
        </div>

        {/* 列表 */}
        <div className="flex flex-col gap-4 pb-24">
          {loading && <p className="py-10 text-center text-sm text-white/40">加载中...</p>}
          {!loading && list.length === 0 && <p className="py-10 text-center text-sm text-white/40">暂无矿机</p>}
          {list.map(item => (
            <MachineCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </PageContainer>
  )
}

function fmt(v: string | number | undefined) {
  if (!v && v !== 0) return '0.00'
  return Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function MachineCard({ item }: { item: MachineItem }) {
  const isActive = item.status === 'active' || item.status === '1'

  return (
    <div className="flex gap-3 rounded-[14px] bg-[#1e1e1e] p-3.5">
      {/* 左侧图片 */}
      <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
        {item.image
          ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          : <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-600" />}
      </div>

      {/* 右侧信息 */}
      <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="truncate text-base font-bold text-white">{item.name}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            isActive ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
          }`}>
            {item.status_text || (isActive ? '运行中' : '已过期')}
          </span>
        </div>

        <InfoRow label="算力" value={`${fmt(item.power)}T`} />
        <InfoRow label="日收益" value={fmt(item.daily_income)} />
        <InfoRow label="总收益" value={fmt(item.total_income)} />
        <InfoRow label="到期时间" value={item.expire_at} />
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <img src="/old-pages/ming/dot.svg" alt="" className="h-1.5 w-1.5" />
        <span className="text-xs text-white/60">{label}</span>
      </div>
      <span className="text-xs text-white">{value}</span>
    </div>
  )
}
