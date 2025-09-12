'use client';
import { useEffect } from 'react';

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Modal({ open, title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* dialog */}
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-[rgba(20,20,28,0.98)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title ?? 'Notice'}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-white/60 hover:text-white focus:outline-none"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor" d="M18.3 5.7L12 12l6.3 6.3l-1.4 1.4L10.6 13.4L4.3 19.7L2.9 18.3L9.2 12L2.9 5.7L4.3 4.3l6.3 6.3l6.3-6.3z"/>
            </svg>
          </button>
        </div>

        <div className="text-white/85">{children}</div>

        {footer && (
          <div className="mt-5 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
