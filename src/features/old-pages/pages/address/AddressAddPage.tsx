import { addAddress } from '../../services/api'
import { AddressForm } from './AddressForm'

export function AddressAddPage() {
  return <AddressForm title="新增地址" onSubmit={data => addAddress(data).then(() => {})} />
}
