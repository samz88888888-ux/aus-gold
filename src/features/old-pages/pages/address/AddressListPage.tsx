import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { ConfirmPopup } from '../../components/ConfirmPopup'
import { fetchAddressList, deleteAddress, setDefaultAddress } from '../../services/api'
import type { AddressItem } from '../../services/types'

export function AddressListPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from') || ''
  const [list, setList] = useState<AddressItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    fetchAddressList().then(data => { setList(data); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async () => {
    if (deleteTarget === null) return
    await deleteAddress(deleteTarget)
    setList(prev => prev.filter(a => a.id !== deleteTarget))
    setDeleteTarget(null)
  }

  const handleSetDefault = async (id: number) => {
    await setDefaultAddress(id)
    setList(prev => prev.map(a => ({ ...a, is_default: a.id === id ? 1 : 0 })))
  }

  const handleSelect = (item: AddressItem) => {
    if (from) {
      navigate(`/${from}?address_id=${item.id}`, { replace: true })
    }
  }

  return (
    <PageContainer>
      <PageNavBar title="收货地址" />
      <div className="px-4 py-4">
        {loading ? (
          <p className="py-20 text-center text-sm text-white/40">加载中...</p>
        ) : list.length === 0 ? (
          <p className="py-20 text-center text-sm text-white/40">暂无收货地址</p>
        ) : (
          <div className="space-y-3">
            {list.map(item => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4" onClick={() => handleSelect(item)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{item.real_name}</span>
                      <span className="text-xs text-white/50">{item.phone}</span>
                      {item.is_default === 1 && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">默认</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-white/50">
                      {item.province}{item.city}{item.district}{item.address}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleSetDefault(item.id) }}
                    className={`flex items-center gap-1.5 text-xs ${item.is_default === 1 ? 'text-amber-400' : 'text-white/40'}`}>
                    <span className={`inline-block h-4 w-4 rounded-full border-2 ${item.is_default === 1 ? 'border-amber-400 bg-amber-400' : 'border-white/30'}`} />
                    设为默认
                  </button>
                  <div className="flex gap-3">
                    <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/address/edit/${item.id}`) }}
                      className="text-xs text-white/50 hover:text-white">编辑</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteTarget(item.id) }}
                      className="text-xs text-red-400/70 hover:text-red-400">删除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 border-t border-white/10 bg-[#0a0a1a]/95 px-4 py-3 backdrop-blur">
        <button type="button" onClick={() => navigate('/address/add')}
          className="w-full rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 py-3 text-sm font-bold text-black">
          新增收货地址
        </button>
      </div>

      <ConfirmPopup visible={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="删除地址" message="确定要删除该收货地址吗？" confirmText="删除" cancelText="取消" />
    </PageContainer>
  )
}
