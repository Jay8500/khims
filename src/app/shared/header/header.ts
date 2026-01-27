import {
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
  OnInit,
  ElementRef,
  HostListener,
} from '@angular/core';
import { Supabase } from '../../services/supabase';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Branding } from '../../services/branding';
import { Theme } from '../../services/theme';
@Component({
  selector: 'app-header',
  standalone: true, // Ensuring standalone is clear
  imports: [CommonModule],
  templateUrl: './header.html'
})
export class Header implements OnInit {
  private eRef = inject(ElementRef);
  isProfileOpen = signal(false);
  public supabase = inject(Supabase);
  public branding = inject(Branding);
  private router = inject(Router);
  private themeService = inject(Theme);

  userEmail = signal('');
  userInitial = signal('');
  public tenantInfo: any = signal<any>({});

  // --- ADD THIS LOGIC ---
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // If the click is NOT inside this component (the header)
    // and the profile is open, close it.
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isProfileOpen.set(false);
    }
  }
  // CONCEPT 4 INTEGRATION: Shared Holiday Signal
  // In the future, this will be fetched from your 'holidays' table in Supabase
  holidays = signal([
    { date: '2026-01-01', reason: 'New Year Celebration', type: 'Global', icon: '🎆' },
    { date: '2026-01-26', reason: 'Republic Day', type: 'National', icon: '🏛️' },
  ]);

  @Output() menuClick = new EventEmitter<void>();

  onMenuClick() {
    this.menuClick.emit();
  }

  async ngOnInit() {
    this.tenantInfo.set(this.supabase.getTenantInfo());
    const { data } = await this.supabase.client.auth.getUser();
    if (data.user?.email) {
      this.userEmail.set(data.user.email ?? '');
      // Fixed: Setting initial to the first letter of email
      await this.supabase.fetchUserProfile(data.user.id);

      // Update Initial based on First Name if available, else Email
      const profile = this.supabase.currentProfile();
      let usEmail = data.user.email.charAt(0);
      this.userInitial.set(usEmail);
    }
  }

  toggleProfile() {
    this.isProfileOpen.update((prev) => !prev);
  }

  async handleLogout() {
    const { error } = await this.supabase.client.auth.signOut();
    if (!error) {
      this.isProfileOpen.set(false);
      this.router.navigate(['/login']);
    }
  }

  async personalInfo() {
    this.isProfileOpen.set(false); // Clean UI: close menu before navigating
    this.router.navigate(['/dashboard/profile']);
  }
  // New Theme Methods
  setTheme(theme: 'light' | 'dark' | 'system') {
    this.themeService.updateTheme(theme);
  }

  get currentTheme() {
    return localStorage.getItem('user-theme') || 'system';
  }
}
