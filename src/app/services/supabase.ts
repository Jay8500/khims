import { inject, Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class Supabase {
  private supabase: SupabaseClient;
  private router = inject(Router);
  // 1. New Signal for Duplicate Session Detection
  public isDuplicateTab = signal(false);
  private sessionChannel = new BroadcastChannel('hms_session_guard');
  constructor() {
    // Use dot notation (no brackets, no quotes)
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // If the user is logged out, force them to the login page
        this.router.navigate(['/login']);
      }
    });
    this.initSessionGuard();
  }
  private tabId = Math.random().toString(36).substring(7);

  private async initSessionGuard() {
    this.sessionChannel.onmessage = async (event) => {
      // 1. Get the current session
      const { data } = await this.supabase.auth.getSession();

      // 2. Only run the guard if a user is actually logged in
      if (!data.session) return;

      if (event.data.type === 'new_hms_tab_opened' && event.data.from !== this.tabId) {
        this.isDuplicateTab.set(true);
        this.sessionChannel.postMessage({
          type: 'existing_tab_confirmed',
          from: this.tabId,
        });
      }

      if (event.data.type === 'existing_tab_confirmed' && event.data.from !== this.tabId) {
        this.isDuplicateTab.set(true);
      }
    };

    // Announce ourselves only after a short delay
    setTimeout(() => {
      this.sessionChannel.postMessage({
        type: 'new_hms_tab_opened',
        from: this.tabId,
      });
    }, 1000); // Increased to 1s for better stability during redirects
  }
  // Use this to get the client in components
  get client() {
    return this.supabase;
  }

  // Helper for Auth
  get auth() {
    return this.supabase.auth;
  }
}
