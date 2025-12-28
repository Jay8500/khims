import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-pagecontainer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white dark:bg-slate-900 min-h-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative transition-all duration-300"
    >
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 animate-pulse">
        <div
          class="w-12 h-12 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin"
        ></div>
        <p class="mt-4 text-slate-400 dark:text-slate-500 text-sm font-medium tracking-wide">
          Loading records...
        </p>
      </div>

      <div [class.hidden]="loading" class="animate-in fade-in duration-500">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class Pagecontainer {
  @Input() loading: boolean = false;
}
