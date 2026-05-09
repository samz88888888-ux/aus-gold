import { addAddress } from '../../services/api'
import { getOldPagesCopy } from '../../i18n'
import { AddressForm } from './AddressForm'
import type { AppPage, PageParams } from '../../../figma/types'

type AddressAddPageProps = {
  from?: string
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function AddressAddPage({ from, onNavigate }: AddressAddPageProps) {
  const code = (typeof window !== 'undefined' ? window.localStorage.getItem('mcg-language') : null) as Parameters<typeof getOldPagesCopy>[0] | null
  const copy = getOldPagesCopy(code ?? 'zh-TW')
  return <AddressForm title={copy.addAddress} from={from} onSubmit={data => addAddress(data).then(() => {})} onNavigate={onNavigate} />
}
