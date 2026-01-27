import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // <--- MUST BE HERE
import { CommonModule } from '@angular/common';
import { Supabase } from '../../services/supabase';
import { Toaster } from '../../services/toaster';
import { NavModule, NavDocument } from '../../models/navigation.model';
import { ApiResponse } from '../../models/api-response.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // Add this
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html'
})
export class Sidebar implements OnInit {
  @Input() isExpanded = true;
  private router = inject(Router);
  private supabase = inject(Supabase);
  menuModules = signal<NavModule[]>([]);
  public isLoading = signal(true);
  private sanitizer = inject(DomSanitizer); // Inject Sanitizer
  // 1. Define your Registry with your actual SVG paths
  private iconRegistry: Record<string, string> = {
    // SETUP MODULE
    layers:
      '<path d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V7M4 7a2 2 0 012-2h12a2 2 0 012 2M4 7c0 1.1.9 2 2 2h12a2 2 0 002-2M4 12c0 1.1.9 2 2 2h12a2 2 0 002-2" />',
    users:
      '<path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />',
    'building-2':
      '<path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />',
    settings:
      '<path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />',
    'upload-cloud':
      '<path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />',
    map: '<path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />',
    calendar:
      '<path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />',

    // OPERATIONS MODULE
    'trending-up': '<path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />',
    'user-circle':
      '<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />',
    'clipboard-list':
      '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />',
    pill: '<path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.051.046M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />',
    package: '<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />',
    flask: '<path d="M9 3v14a3 3 0 003 3h0a3 3 0 003-3V3M8 3h8M12 17a2 2 0 100-4 2 2 0 000 4z" />',

    // FINANCE MODULE
    receipt:
      '<path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />',
    'bar-chart-big':
      '<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />',
    'user-plus':
      '<path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm11 1h-6m3-3v6" />', // Registration
    stethoscope: '<path d="M22 12h-4l-3 9L9 3l-3 9H2" />', // Consultation
    microscope:
      '<path d="M6 18h8m-8-3h5m1-9h1m-1 4h1m-4-7v14a2 2 0 002 2h0a2 2 0 002-2V3m-4 0h4" />', // Lab
    'credit-card':
      '<path d="M1 10h22M1 15h22M1 20h22M1 5h22a2 2 0 012 2v12a2 2 0 01-2 2H1a2 2 0 01-2-2V7a2 2 0 012-2z" />', // Billing
    'test-tube':
      '<path d="M10 2v7.31a3 3 0 010 5.38V20a2 2 0 002 2h0a2 2 0 002-2v-5.31a3 3 0 010-5.38V2m-4 0h4m-4 9h4m-4 3h4" />',
    'microscope-alt':
      '<path d="M6 18h8m-8-3h5m1-9h1m-1 4h1m-4-7v14a2 2 0 002 2h0a2 2 0 002-2V3m-4 0h4" />',
  };
  constructor(private toaster: Toaster) {}
  async ngOnInit() {
    await this.loadMenu();
  }

  async handleLogin() {
    // this.isLoading.set(true); // Ensure this is only called on button click
    // try {
    //   // login logic
    // } finally {
    //   // If you enable/disable based on form status,
    //   // ensure the change detection is triggered correctly
    //   setTimeout(async () => this.isLoading.set(false), 0);
    // }
    this.router.navigate(['dashboard/login']);
  }

  async loadMenu() {
    const response: ApiResponse<NavModule[]> = await this.supabase.getSidebarMenu();
    if (response.statusCode === 200) {
      // 2. Bind the 15 documents through the modules
      this.menuModules.set(response.data);
    } else {
      // console.error('Menu Error:', response.message);
    }
  }

  getIconPath(iconName: string): SafeHtml {
    const path = this.iconRegistry[iconName] || this.iconRegistry['default'];
    return this.sanitizer.bypassSecurityTrustHtml(path);
  }
}
