import { Injectable, signal } from '@angular/core';
export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
@Injectable({
  providedIn: 'root',
})
export class Toaster {
  toasts = signal<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'success') {
    const id = Date.now();
    this.toasts.update((t) => [...t, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.toasts.update((t) => t.filter((x) => x.id !== id));
    }, 3000);
  }
}
