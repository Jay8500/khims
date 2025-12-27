import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Supabase } from '../../services/supabase';
import { Branding } from '../../services/branding';
@Component({
  selector: 'app-login',
  imports: [FormsModule],
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

  async handleLogin() {
    this.loading = true;
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    });

    if (error) {
      alert(error.message);
    } else if (data.session) {
      // Supabase saves the JWT in LocalStorage automatically here
      this.router.navigate(['/dashboard']);
    }
    this.loading = false;
  }
}
