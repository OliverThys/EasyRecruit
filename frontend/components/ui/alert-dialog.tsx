'use client';

import { ReactNode } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './button';

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  confirmText?: string;
  onConfirm?: () => void;
}

export function AlertDialog({
  open,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  onConfirm,
}: AlertDialogProps) {
  if (!open) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const icons = {
    success: <CheckCircle className="h-6 w-6 text-green-600" />,
    error: <AlertCircle className="h-6 w-6 text-red-600" />,
    warning: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
    info: <Info className="h-6 w-6 text-blue-600" />,
  };

  const bgColors = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    warning: 'bg-yellow-50',
    info: 'bg-blue-50',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200 animate-in fade-in-0 zoom-in-95">
        <div className={`${bgColors[type]} p-6 rounded-t-xl border-b border-gray-200`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-6 whitespace-pre-line">{message}</p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4"
            >
              {type === 'info' ? 'Fermer' : 'Annuler'}
            </Button>
            {onConfirm && (
              <Button
                onClick={handleConfirm}
                className={`px-4 ${
                  type === 'success'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    : type === 'error'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                } text-white`}
              >
                {confirmText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'danger';
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  variant = 'default',
}: ConfirmDialogProps) {
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200 animate-in fade-in-0 zoom-in-95">
        <div className={`${variant === 'danger' ? 'bg-red-50' : 'bg-blue-50'} p-6 rounded-t-xl border-b border-gray-200`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {variant === 'danger' ? (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              ) : (
                <Info className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-6 whitespace-pre-line">{message}</p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              variant={variant === 'danger' ? 'destructive' : 'default'}
              className={`px-4 ${
                variant === 'danger'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

