import { BottomPopup } from './BottomPopup'
import { useOldPagesCopy } from '../i18n'

type AgreementPopupProps = {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
  content: string
}

export function AgreementPopup({ visible, onClose, onConfirm, content }: AgreementPopupProps) {
  const copy = useOldPagesCopy()
  return (
    <BottomPopup visible={visible} onClose={onClose} title={copy.purchaseAgreement}>
      <div className="max-h-[50vh] overflow-y-auto text-sm leading-6 text-white/80">{content}</div>
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/20 py-3 text-sm font-medium text-white">{copy.cancel}</button>
        <button type="button" onClick={onConfirm} className="flex-1 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 py-3 text-sm font-bold text-black">{copy.agreeAndBuy}</button>
      </div>
    </BottomPopup>
  )
}
