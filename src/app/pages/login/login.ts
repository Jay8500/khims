import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { Supabase } from '../../services/supabase';
import { Branding } from '../../services/branding';
import { Validator } from '../../shared/validator/validator';
import { Toaster } from '../../services/toaster';
@Component({
  selector: 'app-login',
  imports: [FormsModule, Validator],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  loading = false;

  private supabase = inject(Supabase);
  public branding = inject(Branding);
  private router = inject(Router);
  isSubmitted = signal(false);
  public tenantInfo: any = signal<any>({});

  constructor(private toaster: Toaster) {
    this.tenantInfo.set(this.supabase.getTenantInfo());
  }

  async handleLogin(form: NgForm) {
    this.isSubmitted.set(true);

    if (form.invalid) {
      this.toaster.show('Please fill in all fields correctly', 'warning');
      return;
    }

    this.loading = true;

    // 1. Authenticate with Supabase Auth
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    });

    if (error) {
      this.toaster.show(error.message, 'error');
      this.loading = false;
      return;
    }

    if (data.session) {
      const userId = data.session.user.id;
      // Get the ID of the hospital currently shown on the login page
      const activeHospitalId = this.supabase.currentHospitalId();
      // 2. THE MEMBERSHIP GUARD
      // Does this user exist in the staff_profiles for THIS hospital?
      const { data: profile, error: profileError } = await this.supabase.client
        .from('staff_profiles')
        .select('id, hospital_id')
        .eq('id', userId)
        .eq('hospital_id', activeHospitalId)
        .single();

      if (profileError || !profile) {
        // Logic: User is valid in Auth, but doesn't work for this specific hospital
        await this.supabase.auth.signOut();
        this.toaster.show(
          `Access Denied: You are not a registered staff member of ${
            this.branding.hospitalConfig().name
          }`,
          'error'
        );
        this.loading = false;
        return;
      }

      // 3. Success! They belong here.
      this.router.navigate(['/dashboard']);
    }

    this.loading = false;
  }
}
