import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-slate-950/70"
        onClick={onClose}
        type="button"
      />
      <div className="relative w-full max-w-2xl rounded-2xl border border-fuchsia-500/25 bg-slate-900 p-5 shadow-2xl shadow-fuchsia-900/20">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

