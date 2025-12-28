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
  constructor(private toaster: Toaster) {}
  async handleLogin(form: NgForm) {
    this.isSubmitted.set(true);

    // 3. Prevent Supabase call if form is invalid
    if (form.invalid) {
      this.toaster.show('Please fill in all fields correctly', 'warning');
      return;
    }

    this.loading = true;
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    });

    if (error) {
      // 4. Use Toaster instead of Alert for a pro HIMS look
      this.toaster.show(error.message, 'error');
      this.isSubmitted.set(false); // Reset to allow "Shake" again
    } else if (data.session) {
      // this.toaster.show('Login Successful! Welcome back.', 'success');
      this.router.navigate(['/dashboard']);
    }
    this.loading = false;
  }
}
