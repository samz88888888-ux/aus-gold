import { useState, useEffect, useCallback } from 'react'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchMiningLog } from '../../services/api'
import type { MiningLogItem } from '../../services/types'

const TYPE_OPTIONS = [
  { text: '全部', value: 0 },
  { text: '激活设备', value: 1 },
  { text: '销毁挖矿', value: 2 },
  { text: '减少收益', value: 3 },
  { text: '购买节点', value: 4 },
  { text: '联合挖矿', value: 5 },
  { text: '转移算力', value: 6 },
]

export function MingLogPage() {
  const [list, setList] = useState<MiningLogItem[]>([])
  const [selectedType, setSelectedType] = useState(0)
  const [showSelector, setShowSelector] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async (powerType: number) => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page: 1, page_size: 50 }
      if (powerType !== 0) params.power_type = powerType
      const res = await fetchMiningLog(params)
      setList(res.list ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData(selectedType) }, [selectedType, loadData])

  const currentLabel = TYPE_OPTIONS.find(o => o.value === selectedType)?.text ?? '全部'

  return (
    <PageContainer bgClass="bg-[#050510]">
      <PageNavBar title="算力日志" />

      <div className="min-h-screen px-4 pt-5"
        style={{ backgroundImage: "url('/old-pages/ming/ming-list-bg.png')", backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}>

        {/* 筛选器 */}
        <div className="relative mb-5">
          <button
            type="button"
            onClick={() => setShowSelector(!showSelector)}
            className="flex items-center gap-2.5 rounded-full bg-white/10 px-3 py-2 transition-colors hover:bg-white/15"
          >
            <span className="text-xs text-white">{currentLabel}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white/60">
              <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {showSelector && (
            <div className="absolute left-0 top-full z-20 mt-1 w-40 rounded-xl bg-[#1e1e1e] py-1 shadow-xl">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setSelectedType(opt.value); setShowSelector(false) }}
                  className={`w-full px-4 py-2.5 text-left text-xs ${opt.value === selectedType ? 'text-amber-400' : 'text-white/80'} hover:bg-white/5`}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 列表 */}
        <div className="flex flex-col gap-4 pb-20">
          {loading && <p className="py-10 text-center text-sm text-white/40">加载中...</p>}
          {!loading && list.length === 0 && <p className="py-10 text-center text-sm text-white/40">暂无记录</p>}
          {list.map(item => (
            <LogCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </PageContainer>
  )
}

function LogCard({ item }: { item: MiningLogItem }) {
  const isIncome = item.type === '1' || Number(item.amount) > 0
  const prefix = Number(item.amount) >= 0 ? '+' : ''
  const amountColor = isIncome ? 'text-green-400' : 'text-red-400'

  return (
    <div className="relative rounded-[14px] bg-[#1e1e1e] px-4 py-5">
      <div className="absolute right-0 top-0 flex h-[27px] w-[71px] items-center justify-center rounded-bl-[15px] rounded-tr-[15px] bg-white/10">
        <span className="text-xs text-white">{item.type_text}</span>
      </div>
      <div className="flex flex-col gap-3">
        <span className={`text-xl font-bold ${amountColor}`}>
          {prefix}{Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <div className="flex items-center gap-1">
          <img src="/old-pages/ming/dot.svg" alt="" className="h-2 w-2" />
          <span className="text-[13px] text-white">{item.created_at}</span>
        </div>
        {item.remark && <p className="text-xs text-white/50">{item.remark}</p>}
      </div>
    </div>
  )
}
