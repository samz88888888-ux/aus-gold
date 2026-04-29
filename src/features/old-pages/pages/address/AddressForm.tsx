import { useState } from 'react'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { NoticePopup } from '../../components/NoticePopup'
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
    if (!form.real_name.trim()) { setNoticeMessage('请输入收货人姓名'); return }
    if (!form.phone.trim() || form.phone.length < 8) { setNoticeMessage('请输入正确的手机号码'); return }
    if (!form.province.trim() || !form.city.trim()) { setNoticeMessage('请选择省市区'); return }
    if (!form.address.trim()) { setNoticeMessage('请输入详细地址'); return }
    setSubmitting(true)
    try {
      await onSubmit(form)
      onNavigate('address', { from })
    } catch {
      setNoticeMessage('操作失败，请重试')
    }
    finally { setSubmitting(false) }
  }

  return (
    <PageContainer>
      <PageNavBar title={title} onBack={() => onNavigate('address', { from })} />
      <div className="space-y-4 px-4 pb-[calc(156px+env(safe-area-inset-bottom))] pt-4">
        <Field label="收货人" value={form.real_name} placeholder="请输入收货人姓名"
          onChange={v => update('real_name', v)} />
        <Field label="手机号码" value={form.phone} placeholder="请输入手机号码" type="tel" maxLength={11}
          onChange={v => update('phone', v)} />
        <Field label="省份" value={form.province} placeholder="请输入省份"
          onChange={v => update('province', v)} />
        <Field label="城市" value={form.city} placeholder="请输入城市"
          onChange={v => update('city', v)} />
        <Field label="区/县" value={form.district} placeholder="请输入区/县"
          onChange={v => update('district', v)} />
        <Field label="详细地址" value={form.address} placeholder="请输入详细地址（街道、门牌号等）"
          onChange={v => update('address', v)} />

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="text-sm text-white/70">设为默认地址</span>
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
          {submitting ? '提交中...' : '保存'}
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
