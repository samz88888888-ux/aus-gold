import { addAddress } from '../../services/api'
import { AddressForm } from './AddressForm'
import type { AppPage, PageParams } from '../../../figma/types'

type AddressAddPageProps = {
  from?: string
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function AddressAddPage({ from, onNavigate }: AddressAddPageProps) {
  return <AddressForm title="新增地址" from={from} onSubmit={data => addAddress(data).then(() => {})} onNavigate={onNavigate} />
}
