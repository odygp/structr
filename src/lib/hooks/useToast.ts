'use client';

import { useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l([...toasts]));
}

export function showToast(message: string, type: ToastType = 'info', duration = 3000) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, message, type, duration }];
  notify();

  if (duration > 0) {
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notify();
    }, duration);
  }
}

export function useToast() {
  const [current, setCurrent] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.add(setCurrent);
    return () => { listeners.delete(setCurrent); };
  }, []);

  const dismiss = useCallback((id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  }, []);

  return { toasts: current, dismiss };
}
