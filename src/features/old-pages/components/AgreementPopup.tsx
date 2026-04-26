import { BottomPopup } from './BottomPopup'

type AgreementPopupProps = {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
  content: string
}

export function AgreementPopup({ visible, onClose, onConfirm, content }: AgreementPopupProps) {
  return (
    <BottomPopup visible={visible} onClose={onClose} title="购买协议">
      <div className="max-h-[50vh] overflow-y-auto text-sm leading-6 text-white/80">{content}</div>
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/20 py-3 text-sm font-medium text-white">取消</button>
        <button type="button" onClick={onConfirm} className="flex-1 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 py-3 text-sm font-bold text-black">同意并购买</button>
      </div>
    </BottomPopup>
  )
}
