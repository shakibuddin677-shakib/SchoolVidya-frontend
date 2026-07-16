import { X } from "lucide-react";

// Har module (Student/Teacher/Parent/Class...) ka Add/Edit form isi Modal ke andar khulega - consistent overlay + close button + sizing
function Modal({ title, isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - click karne se modal band ho jaye */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-100 z-10">
          <h3 className="font-display font-semibold text-ink text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
