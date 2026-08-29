import { useUIStore } from '../store/useUIStore';

export function useToast() {
  const { addToast, removeToast, toasts } = useUIStore();

  return {
    toasts,
    toast: addToast,
    toastSuccess: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    toastError: (title: string, message?: string) => addToast({ type: 'error', title, message }),
    toastInfo: (title: string, message?: string) => addToast({ type: 'info', title, message }),
    toastWarning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    removeToast,
  };
}
