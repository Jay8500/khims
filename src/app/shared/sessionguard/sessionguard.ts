import { Component, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-sessionguard',
  standalone: true,
  template: `
    <div
      class="fixed inset-0 z-[999] bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in duration-300"
      >
        <div
          class="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Active Session Found</h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm mb-8">
          This app is already open in another tab. Using multiple sessions can cause data errors.
        </p>

        <div class="flex flex-col gap-3">
          <button
            (click)="onLogout.emit()"
            class="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-none"
          >
            Sign Out & Close
          </button>
          <button
            (click)="onIgnore.emit()"
            class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
          >
            Ignore and continue
          </button>
        </div>
      </div>
    </div>
  `,
})
export class Sessionguard {
  @Output() onLogout = new EventEmitter<void>();
  @Output() onIgnore = new EventEmitter<void>();
}
