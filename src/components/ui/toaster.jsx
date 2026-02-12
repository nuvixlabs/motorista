import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

let toastStore = [];
let listeners = [];

export const createToast = (config) => {
  const id = Date.now();
  const toast = {
    id,
    ...config,
  };

  toastStore = [...toastStore, toast];
  notifyListeners();

  // Auto remove after 3 seconds
  setTimeout(() => {
    dismissToast(id);
  }, 3000);

  return id;
};

export const dismissToast = (id) => {
  toastStore = toastStore.filter((t) => t.id !== id);
  notifyListeners();
};

const notifyListeners = () => {
  listeners.forEach((listener) => listener(toastStore));
};

const subscribe = (listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const Toaster = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribe((newToasts) => {
      setToasts([...newToasts]);
    });
  }, []);

  return (
    <div className="fixed right-0 bottom-0 z-50 flex max-w-md flex-col gap-2 p-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={cn(
                'rounded-lg border px-4 py-3 shadow-lg flex items-start gap-3',
                toast.variant === 'destructive'
                  ? 'border-red-300 bg-red-50'
                  : 'border-green-300 bg-green-50'
              )}
            >
              <div className="flex-shrink-0 pt-0.5">
                {toast.variant === 'destructive' ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                {toast.title && (
                  <h3
                    className={cn(
                      'font-semibold',
                      toast.variant === 'destructive' ? 'text-red-900' : 'text-green-900'
                    )}
                  >
                    {toast.title}
                  </h3>
                )}
                {toast.description && (
                  <p
                    className={cn(
                      'text-sm',
                      toast.variant === 'destructive' ? 'text-red-800' : 'text-green-800'
                    )}
                  >
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
