import { Component, inject, signal, effect } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { Supabase } from '../../services/supabase';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { Header } from '../../shared/header/header';
import { Pagecontainer } from '../../shared/pagecontainer/pagecontainer';
import { Sessionguard } from '../../shared/sessionguard/sessionguard';
// import { Toasters } from '../../shared/toasters/toasters';
@Component({
  selector: 'app-dashboard-shell',
  imports: [CommonModule, Sidebar, Header, RouterOutlet, Pagecontainer, Sessionguard],
  standalone: true,
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.css',
})
export class DashboardShell {
  public supabase = inject(Supabase);
  private router = inject(Router);
  isSidebarOpen = signal(true);
  isLoading = signal(false);
  staffList = signal<any[]>([]);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isLoading.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Add a tiny delay (200ms) so the loader doesn't "flicker" on fast loads
        setTimeout(() => this.isLoading.set(false), 200);
      }
    });

    // Inside dashboard-shell.ts constructor
    effect(() => {
      const menu = this.supabase.currentMenuModules();
      const currentUrl = this.router.url;

      // Exact check for root or empty path after /dashboard
      const isAtRoot = currentUrl === '/dashboard' || currentUrl === '/dashboard/';

      if (isAtRoot && menu.length > 0) {
        const firstModule = menu[0];
        const firstDoc = firstModule.documents?.[0];
        if (firstDoc?.doc_route) {
          // Use navigateByUrl for cleaner absolute routing
          this.router.navigateByUrl(`${firstDoc.doc_route}`);
        }
      }
    });
  }

  async handleLogout() {
    const { error } = await this.supabase.auth.signOut();
    if (!error) {
      this.router.navigate(['/login']);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen.update((state) => !state);
  }
}
