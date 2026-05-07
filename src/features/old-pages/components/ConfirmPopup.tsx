import { BottomPopup } from './BottomPopup'
import { useOldPagesCopy } from '../i18n'

type ConfirmPopupProps = {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
}

export function ConfirmPopup({ visible, onClose, onConfirm, title, message, confirmText, cancelText }: ConfirmPopupProps) {
  const copy = useOldPagesCopy()
  return (
    <BottomPopup visible={visible} onClose={onClose} title={title ?? copy.confirm}>
      <p className="text-sm leading-6 text-white/80">{message}</p>
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/20 py-3 text-sm font-medium text-white">{cancelText ?? copy.cancel}</button>
        <button type="button" onClick={onConfirm} className="flex-1 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 py-3 text-sm font-bold text-black">{confirmText ?? copy.confirm}</button>
      </div>
    </BottomPopup>
  )
}
