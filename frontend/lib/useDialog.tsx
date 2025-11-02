'use client';

import { useState, useCallback } from 'react';
import { AlertDialog, ConfirmDialog } from '@/components/ui/alert-dialog';

interface AlertOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  confirmText?: string;
  onConfirm?: () => void;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export function useDialog() {
  const [alertState, setAlertState] = useState<AlertOptions & { open: boolean }>({
    open: false,
    title: '',
    message: '',
    type: 'info',
  });

  const [confirmState, setConfirmState] = useState<ConfirmOptions & { open: boolean; onConfirm?: () => void; onCancel?: () => void }>({
    open: false,
    title: '',
    message: '',
    variant: 'default',
  });

  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setAlertState({
        ...options,
        open: true,
        onConfirm: () => {
          if (options.onConfirm) {
            options.onConfirm();
          }
          resolve();
        },
      });
    });
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const handleConfirm = () => {
        setConfirmState((prev) => ({ ...prev, open: false }));
        resolve(true);
      };

      const handleCancel = () => {
        setConfirmState((prev) => ({ ...prev, open: false }));
        resolve(false);
      };

      setConfirmState({
        ...options,
        open: true,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
      });
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, open: false }));
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState((prev) => {
      if (prev.onCancel) {
        prev.onCancel();
      }
      return { ...prev, open: false };
    });
  }, []);

  const DialogComponents = () => (
    <>
      <AlertDialog
        open={alertState.open}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        onConfirm={alertState.onConfirm}
      />
      <ConfirmDialog
        open={confirmState.open}
        onClose={closeConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
        onConfirm={() => {
          if (confirmState.onConfirm) {
            confirmState.onConfirm();
          }
        }}
      />
    </>
  );

  return {
    alert,
    confirm,
    DialogComponents,
  };
}

