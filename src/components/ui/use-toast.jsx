import { useCallback } from 'react';
import { createToast, dismissToast } from './toaster';

export const useToast = () => {
  const toast = useCallback(({ title, description, variant = 'default' }) => {
    return createToast({ title, description, variant });
  }, []);

  const dismiss = useCallback((toastId) => {
    dismissToast(toastId);
  }, []);

  return {
    toast,
    dismiss,
  };
};
