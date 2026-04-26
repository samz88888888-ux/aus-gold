import { useState, useEffect } from 'react'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchAddressDetail, updateAddress } from '../../services/api'
import type { AddressItem } from '../../services/types'
import { AddressForm } from './AddressForm'
import type { AppPage, PageParams } from '../../../figma/types'

type AddressEditPageProps = {
  addressId: string | number
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function AddressEditPage({ addressId, onNavigate }: AddressEditPageProps) {
  const [address, setAddress] = useState<AddressItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAddressDetail(Number(addressId)).then(data => { setAddress(data ?? null); setLoading(false) }).catch(() => setLoading(false))
  }, [addressId])

  if (loading) return <PageContainer><PageNavBar title="编辑地址" onBack={() => onNavigate('address')} /><p className="py-20 text-center text-sm text-white/40">加载中...</p></PageContainer>
  if (!address) return <PageContainer><PageNavBar title="编辑地址" onBack={() => onNavigate('address')} /><p className="py-20 text-center text-sm text-white/40">地址不存在</p></PageContainer>

  return (
    <AddressForm title="编辑地址" initial={address}
      onSubmit={data => updateAddress(address.id, data)} onNavigate={onNavigate} />
  )
}
