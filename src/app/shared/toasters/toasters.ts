import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toaster } from '../../services/toaster';
@Component({
  selector: 'app-toasters',
  imports: [],
  template: `
    <div class="fixed top-6 right-6 z-[1000] flex flex-col gap-3 pointer-events-none">
      @for (toast of toaster.toasts(); track toast.id) {
      <div
        [class.bg-emerald-500]="toast.type === 'success'"
        [class.bg-red-500]="toast.type === 'error'"
        [class.bg-amber-500]="toast.type === 'warning'"
        class="min-w-[300px] px-6 py-4 rounded-[24px] text-white shadow-2xl shadow-slate-900/10 pointer-events-auto flex items-center justify-between animate-in slide-in-from-right duration-300"
      >
        <div class="flex items-center gap-3">
          <span class="text-lg">{{ getIcon(toast.type) }}</span>
          <span class="text-xs font-black uppercase tracking-widest">{{ toast.message }}</span>
        </div>

        <div
          class="absolute bottom-0 left-0 h-1 bg-white/30 animate-shrink-width"
          style="animation-duration: 3s"
        ></div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      @keyframes shrink {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }
      .animate-shrink-width {
        animation-name: shrink;
        animation-timing-function: linear;
      }
    `,
  ],
})
export class Toasters {
  public toaster = inject(Toaster);

  getIcon(type: string) {
    if (type === 'success') return '✅';
    if (type === 'error') return '🚨';
    return '⚠️';
  }
}
