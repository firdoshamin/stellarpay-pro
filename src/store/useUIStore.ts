import { create } from 'zustand';
import { ModalId, ToastMessage } from '../types/ui';

interface UIStoreState {
  activeModal: ModalId;
  sidebarOpen: boolean;
  toasts: ToastMessage[];
  openModal: (modalId: ModalId) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  activeModal: null,
  sidebarOpen: true,
  toasts: [],

  openModal: (modalId: ModalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    const duration = toast.duration || 4000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
