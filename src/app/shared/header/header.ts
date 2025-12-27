import { Component, EventEmitter, inject, Output, signal, OnInit } from '@angular/core';
import { Supabase } from '../../services/supabase';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Branding } from '../../services/branding';

@Component({
  selector: 'app-header',
  standalone: true, // Ensuring standalone is clear
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isProfileOpen = signal(false);
  private supabase = inject(Supabase);
  public branding = inject(Branding);
  private router = inject(Router);

  userEmail = signal('');
  userInitial = signal('');

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
    const { data } = await this.supabase.client.auth.getUser();
    if (data.user?.email) {
      this.userEmail.set(data.user.email);
      // Fixed: Setting initial to the first letter of email
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
}
