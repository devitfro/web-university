export default function Modal({
  open,
  title,
  children,
  onClose,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm'
}) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={e => e.stopPropagation()}
      >
        <h3>{title}</h3>

        <div>{children}</div>

        <div className="modal-actions">
          <button onClick={onClose}>
            {cancelText}
          </button>

          <button onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}