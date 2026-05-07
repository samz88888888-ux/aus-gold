import { BottomPopup } from './BottomPopup'
import { useOldPagesCopy } from '../i18n'

type NoticePopupProps = {
  visible: boolean
  onClose: () => void
  title?: string
  message: string
  confirmText?: string
  onConfirm?: () => void
}

export function NoticePopup({
  visible,
  onClose,
  title,
  message,
  confirmText,
  onConfirm,
}: NoticePopupProps) {
  const copy = useOldPagesCopy()
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
      return
    }
    onClose()
  }

  return (
    <BottomPopup visible={visible} onClose={onClose} title={title ?? copy.noticeTitle}>
      <p className="text-sm leading-6 text-white/80">{message}</p>
      <button
        type="button"
        onClick={handleConfirm}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 py-3 text-sm font-bold text-black"
      >
        {confirmText ?? copy.noticeConfirm}
      </button>
    </BottomPopup>
  )
}
