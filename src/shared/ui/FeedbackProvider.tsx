import { LoadError } from '@/shared/ui/LoadError';
import { lazy } from 'react';
/*
=============================
FeedbackProvider
--> Notifikasi sementara dan dialog yang dimuat sesuai kebutuhan.
=============================
*/

import { CheckCircle2 } from 'lucide-react';
import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { FeedbackContext, type Modal } from './feedback';

const StockDialog = lazy(() =>
  import('@/features/pantry/StockDialog')
    .then((m) => ({ default: m.StockDialog }))
    .catch(() => ({ default: LoadError })),
);
const DeleteDialog = lazy(() =>
  import('@/features/pantry/DeleteDialog')
    .then((m) => ({ default: m.DeleteDialog }))
    .catch(() => ({ default: LoadError })),
);
const RecipeDialog = lazy(() =>
  import('@/features/planning/components/RecipeDialog')
    .then((m) => ({ default: m.RecipeDialog }))
    .catch(() => ({ default: LoadError })),
);
const SwapDialog = lazy(() =>
  import('@/features/planning/components/SwapDialog')
    .then((m) => ({ default: m.SwapDialog }))
    .catch(() => ({ default: LoadError })),
);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const notify = (message: string) => {
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(''), 4000);
  };
  return (
    <FeedbackContext
      value={{
        notify,
        setModal: () => {
          throw new Error('ModalProvider diperlukan.');
        },
      }}
    >
      {children}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </FeedbackContext>
  );
}

// Dialog berada di dalam lingkup akun sehingga tidak dapat memakai data akun sebelumnya.
export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<Modal>(null);
  return (
    <ModalContents modal={modal} setModal={setModal}>
      {children}
    </ModalContents>
  );
}

function ModalContents({
  modal,
  setModal,
  children,
}: {
  modal: Modal;
  setModal: React.Dispatch<React.SetStateAction<Modal>>;
  children: ReactNode;
}) {
  // Konteks notifikasi diwarisi; hanya state dialog yang memiliki lingkup akun.
  const feedback = useFeedback();
  useEffect(() => {
    const close = () => setModal(null);
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, [setModal]);
  return (
    <FeedbackContext value={{ notify: feedback.notify, setModal }}>
      {children}
      {modal && (
        <div className="workspace-surface allianz-surface modal-surface">
          <Suspense
            fallback={
              <p className="loading" role="status">
                Memuat dialog…
              </p>
            }
          >
            {modal?.type === 'stock' && <StockDialog key={modal.id ?? 'new'} id={modal.id} />}
            {modal?.type === 'delete' && <DeleteDialog id={modal.id} />}
            {modal?.type === 'recipe' && <RecipeDialog d={modal.d} s={modal.s} />}
            {modal?.type === 'swap' && <SwapDialog d={modal.d} s={modal.s} />}
          </Suspense>
        </div>
      )}
    </FeedbackContext>
  );
}

import { useFeedback } from './feedback';
