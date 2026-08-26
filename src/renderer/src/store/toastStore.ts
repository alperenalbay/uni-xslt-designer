import { create } from 'zustand'

export interface ToastItem {
  id: number
  message: string
  kind: 'info' | 'error'
}

interface ToastState {
  toasts: ToastItem[]
  push: (message: string, kind?: 'info' | 'error') => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, kind = 'info') => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, message, kind }] }))
    window.setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 2600)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}))
