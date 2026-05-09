import { useState } from 'react'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { NoticePopup } from '../../components/NoticePopup'
import { useOldPagesCopy } from '../../i18n'
import type { AddressFormData } from '../../services/types'
import type { AppPage, PageParams } from '../../../figma/types'

type AddressFormProps = {
  title: string
  from?: string
  initial?: Partial<AddressFormData>
  onSubmit: (data: AddressFormData) => Promise<void>
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function AddressForm({ title, from, initial, onSubmit, onNavigate }: AddressFormProps) {
  const copy = useOldPagesCopy()
  const [form, setForm] = useState<AddressFormData>({
    real_name: initial?.real_name ?? '',
    phone: initial?.phone ?? '',
    province: initial?.province ?? '',
    city: initial?.city ?? '',
    district: initial?.district ?? '',
    address: initial?.address ?? '',
    is_default: initial?.is_default ?? 0,
  })
  const [submitting, setSubmitting] = useState(false)
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null)

  const update = (key: keyof AddressFormData, value: string | number) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.real_name.trim()) { setNoticeMessage(copy.invalidRecipient); return }
    if (!form.phone.trim() || form.phone.length < 8) { setNoticeMessage(copy.invalidPhone); return }
    if (!form.province.trim() || !form.city.trim()) { setNoticeMessage(copy.selectProvinceCityDistrict); return }
    if (!form.address.trim()) { setNoticeMessage(copy.invalidDetailAddress); return }
    setSubmitting(true)
    try {
      await onSubmit(form)
      onNavigate('address', { from })
    } catch {
      setNoticeMessage(copy.actionFailedRetry)
    }
    finally { setSubmitting(false) }
  }

  return (
    <PageContainer>
      <PageNavBar title={title} onBack={() => onNavigate('address', { from })} />
      <div className="space-y-4 px-4 pb-[calc(156px+env(safe-area-inset-bottom))] pt-4">
        <Field label={copy.recipient} value={form.real_name} placeholder={copy.enterRecipient}
          onChange={v => update('real_name', v)} />
        <Field label={copy.phoneNumber} value={form.phone} placeholder={copy.enterPhoneNumber} type="tel" maxLength={11}
          onChange={v => update('phone', v)} />
        <Field label={copy.province} value={form.province} placeholder={copy.enterProvince}
          onChange={v => update('province', v)} />
        <Field label={copy.city} value={form.city} placeholder={copy.enterCity}
          onChange={v => update('city', v)} />
        <Field label={copy.district} value={form.district} placeholder={copy.enterDistrict}
          onChange={v => update('district', v)} />
        <Field label={copy.detailAddress} value={form.address} placeholder={copy.enterDetailAddress}
          onChange={v => update('address', v)} />

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="text-sm text-white/70">{copy.setAsDefaultAddress}</span>
          <button
            type="button"
            role="switch"
            aria-checked={form.is_default === 1}
            onClick={() => update('is_default', form.is_default === 1 ? 0 : 1)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${
              form.is_default === 1
                ? 'border-amber-400/65 bg-amber-400/90 shadow-[0_0_16px_rgba(251,191,36,0.25)]'
                : 'border-white/10 bg-white/10'
            }`}
          >
            <span
              className={`block h-5.5 w-5.5 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.28)] transition-transform ${
                form.is_default === 1 ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="fixed bottom-[76px] left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-white/10 bg-[#0a0a1a]/95 px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur">
        <button type="button" onClick={handleSubmit} disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 py-3 text-sm font-bold text-black disabled:opacity-50">
          {submitting ? copy.submitting : copy.save}
        </button>
      </div>

      <NoticePopup
        visible={noticeMessage !== null}
        message={noticeMessage ?? ''}
        onClose={() => setNoticeMessage(null)}
      />
    </PageContainer>
  )
}

function Field({ label, value, placeholder, type = 'text', maxLength, onChange }: {
  label: string; value: string; placeholder: string; type?: string; maxLength?: number; onChange: (v: string) => void
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <label className="mb-1.5 block text-xs text-white/50">{label}</label>
      <input type={type} value={value} placeholder={placeholder} maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25" />
    </div>
  )
}
