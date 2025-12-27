import { Component, inject, OnInit } from '@angular/core';
import { Supabase } from '../../services/supabase';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private supabase = inject(Supabase);
  userEmail: any = '';
  userInitial: any = '';
  async ngOnInit() {
    const { data } = await this.supabase.client.auth.getUser();
    this.userEmail = data.user?.email || 'Admin';
    this.userInitial = data.user?.email?.charAt(0) || 'Admin';
  }
}
