import { addAddress } from '../../services/api'
import { AddressForm } from './AddressForm'
import type { AppPage, PageParams } from '../../../figma/types'

type AddressAddPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function AddressAddPage({ onNavigate }: AddressAddPageProps) {
  return <AddressForm title="新增地址" onSubmit={data => addAddress(data).then(() => {})} onNavigate={onNavigate} />
}
