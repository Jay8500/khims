import { Component, inject, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // <--- MUST BE HERE
import { CommonModule } from '@angular/common';
import { Supabase } from '../../services/supabase';
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() isExpanded = true;
  private router = inject(Router);
  private supabase = inject(Supabase);

  async handleLogout() {
    const { error } = await this.supabase.auth.signOut();
    if (!error) {
      this.router.navigate(['/login']);
    }
  }
}
