import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchAddressDetail, updateAddress } from '../../services/api'
import type { AddressItem } from '../../services/types'
import { AddressForm } from './AddressForm'

export function AddressEditPage() {
  const { id } = useParams<{ id: string }>()
  const [address, setAddress] = useState<AddressItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAddressDetail(Number(id)).then(data => { setAddress(data ?? null); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <PageContainer><PageNavBar title="编辑地址" /><p className="py-20 text-center text-sm text-white/40">加载中...</p></PageContainer>
  if (!address) return <PageContainer><PageNavBar title="编辑地址" /><p className="py-20 text-center text-sm text-white/40">地址不存在</p></PageContainer>

  return (
    <AddressForm title="编辑地址" initial={address}
      onSubmit={data => updateAddress(address.id, data)} />
  )
}
