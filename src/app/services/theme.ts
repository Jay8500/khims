import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class Theme {
  private renderer: Renderer2;
  private colorTheme: 'light' | 'dark' | 'system' = 'system';
  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  initTheme() {
    this.getColorTheme();
    this.applyTheme(this.colorTheme);
  }

  updateTheme(theme: 'light' | 'dark' | 'system') {
    this.colorTheme = theme;
    localStorage.setItem('user-theme', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: 'light' | 'dark' | 'system') {
    const root = window.document.documentElement; // Direct access

    root.classList.remove('dark', 'light');

    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  }

  private getColorTheme() {
    const savedTheme = localStorage.getItem('user-theme') as 'light' | 'dark' | 'system' | null;

    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      this.colorTheme = savedTheme;
    } else {
      this.colorTheme = 'system';
    }
  }
}
