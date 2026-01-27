import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Toasters } from './shared/toasters/toasters';
import { TheJay } from './shared/the-jay/the-jay';
import { Supabase } from './services/supabase';
// import { Loading } from './services/loading';
// import { Branding } from './services/branding';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toasters, TheJay],
  templateUrl: './app.html'
})
export class App {
  protected readonly title = signal('hms-web');
  public router = inject(Router);
  public supabase = inject(Supabase);

  constructor() {
    let tenantInfo = this.supabase.getTenantInfo();
    this.updateBrowserBranding(tenantInfo.name, tenantInfo.logo_url);
  }
  private urlSignal = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
  );

  // Check if user is actually logged into Supabase
  showTheJay = computed(() => {
    const user = this.supabase.currentUser(); // This signal updates on login
    const currentUrl = this.urlSignal() || '';
    const isLoginPage = currentUrl.includes('/login');

    // Show only if user is logged in AND not on login page
    return !!user && !isLoginPage;
  });

  private titleService = inject(Title);

  private updateBrowserBranding(name: string, logoUrl: string) {
    // 1. Update Page Title
    this.titleService.setTitle(`${name} - Portal`);

    // 2. Update Favicon
    const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (link) {
      link.href = logoUrl;
    } else {
      // If no favicon link exists, create one
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = logoUrl;
      document.head.appendChild(newLink);
    }
  }
}
