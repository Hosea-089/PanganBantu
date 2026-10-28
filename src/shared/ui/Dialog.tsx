/*
=============================
Dialog
--> Dialog native dengan fokus terkunci, judul aksesibel, dan dukungan Escape.
=============================
*/

import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

type DialogProps = {
  title: string;
  sub?: string;
  children: ReactNode;
  large?: boolean;
} & ({ dismissible?: true; close: () => void } | { dismissible: false; close?: never });

export function Dialog({
  title,
  sub,
  children,
  close,
  large = false,
  dismissible = true,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const subId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="overlay native-dialog"
      aria-labelledby={titleId}
      aria-describedby={sub ? subId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) close?.();
      }}
    >
      <div className={'dialog ' + (large ? 'large' : '')}>
        <div className="dialog-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {sub && <p id={subId}>{sub}</p>}
          </div>
          {dismissible && (
            <button type="button" className="dialog-close" aria-label="Tutup" onClick={close}>
              <X size={18} />
            </button>
          )}
        </div>
        {children}
      </div>
    </dialog>
  );
}
