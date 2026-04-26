import { useEffect, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
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

type DestoryListPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function DestoryListPage({ onNavigate }: DestoryListPageProps) {
  const [activeTab, setActiveTab] = useState(2)
  const [list, setList] = useState<MachineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tab = TAB_LIST.find((t) => t.type === activeTab)
    if (!tab) return

    fetchMachineList({ page: 1, page_size: 50, machine_type: tab.type })
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [activeTab])

  const handleTabChange = (type: number) => {
    if (type === activeTab) return
    setLoading(true)
    setActiveTab(type)
  }

  return (
    <PageContainer bgClass="bg-[#050505]">
      <PageNavBar title="我的礦機" onBack={() => onNavigate('ming')} />

      <div className="relative overflow-hidden px-4 pb-10 pt-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[320px] bg-[radial-gradient(circle_at_top,rgba(251,208,5,0.2),rgba(251,208,5,0.04)_42%,transparent_72%)]" />

        <section className="relative rounded-[24px] border border-[#f6c640]/20 bg-[linear-gradient(165deg,rgba(24,24,24,0.98)_0%,rgba(10,10,10,0.98)_100%)] p-4 shadow-[0_14px_36px_rgba(0,0,0,0.35)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f6c640]">
            My Mining Machines
          </p>
          <h2 className="mt-1 text-[22px] font-black text-white">設備列表</h2>
          <p className="mt-2 text-xs text-white/55">按設備類型查看當前礦機收益與狀態</p>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {TAB_LIST.map((tab) => {
              const active = activeTab === tab.type
              return (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => handleTabChange(tab.type)}
                  className={[
                    'shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition',
                    active
                      ? 'border border-[#f6c640] bg-[#f6c640]/14 text-[#f6c640]'
                      : 'border border-white/10 bg-white/[0.02] text-white/60',
                  ].join(' ')}
                >
                  {tab.text}
                </button>
              )
            })}
          </div>
        </section>

        <section className="relative mt-4 space-y-3">
          {loading ? (
            <p className="py-10 text-center text-sm text-white/35">加载中...</p>
          ) : list.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/30">暂无矿机</p>
          ) : (
            list.map((item) => <MachineCard key={item.id} item={item} />)
          )}
        </section>
      </div>
    </PageContainer>
  )
}

function fmt(v: string | number | undefined) {
  if (!v && v !== 0) return '0.00'
  return Number(v).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function MachineCard({ item }: { item: MachineItem }) {
  const isActive = item.status === 'active' || item.status === '1'

  return (
    <article className="overflow-hidden rounded-[20px] border border-white/8 bg-[linear-gradient(160deg,rgba(25,25,25,0.95),rgba(10,10,10,0.95))] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.24)]">
      <div className="flex gap-3">
        <div className="flex h-[86px] w-[86px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-[#f6c640]/18 bg-white/[0.03]">
          {item.image ? (
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-600" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[17px] font-black text-white">{item.name}</h3>
            <span
              className={[
                'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                isActive
                  ? 'border-emerald-500/30 bg-emerald-500/12 text-emerald-300'
                  : 'border-white/10 bg-white/[0.02] text-white/45',
              ].join(' ')}
            >
              {item.status_text || (isActive ? '运行中' : '已过期')}
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <InfoTile label="算力" value={`${fmt(item.power)}T`} />
            <InfoTile label="日收益" value={fmt(item.daily_income)} />
            <InfoTile label="总收益" value={fmt(item.total_income)} />
            <InfoTile label="到期时间" value={item.expire_at} />
          </div>
        </div>
      </div>
    </article>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-white/8 bg-white/[0.02] px-2.5 py-2">
      <p className="text-[10px] text-white/38">{label}</p>
      <p className="mt-1 truncate text-[12px] font-semibold text-white/84">{value}</p>
    </div>
  )
}
