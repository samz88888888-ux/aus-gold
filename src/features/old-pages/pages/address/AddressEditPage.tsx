import { useState, useEffect } from 'react'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { useOldPagesCopy } from '../../i18n'
import { fetchAddressDetail, updateAddress } from '../../services/api'
import type { AddressItem } from '../../services/types'
import { AddressForm } from './AddressForm'
import type { AppPage, PageParams } from '../../../figma/types'

type AddressEditPageProps = {
  addressId: string | number
  from?: string
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function AddressEditPage({ addressId, from, onNavigate }: AddressEditPageProps) {
  const copy = useOldPagesCopy()
  const [address, setAddress] = useState<AddressItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAddressDetail(Number(addressId)).then(data => { setAddress(data ?? null); setLoading(false) }).catch(() => setLoading(false))
  }, [addressId])

  if (loading) return <PageContainer><PageNavBar title={copy.editAddress} onBack={() => onNavigate('address', { from })} /><p className="py-20 text-center text-sm text-white/40">{copy.loading}</p></PageContainer>
  if (!address) return <PageContainer><PageNavBar title={copy.editAddress} onBack={() => onNavigate('address', { from })} /><p className="py-20 text-center text-sm text-white/40">{copy.addressNotFound}</p></PageContainer>

  return (
    <AddressForm title={copy.editAddress} initial={address}
      from={from}
      onSubmit={data => updateAddress(address.id, data)} onNavigate={onNavigate} />
  )
}
