import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Supabase } from '../services/supabase';
export const authGuard: CanActivateFn = async (route, state) => {
  const supabase = inject(Supabase);
  const router = inject(Router);

  // 1. Ask Supabase for the current session
  const {
    data: { session },
  } = await supabase.client.auth.getSession();

  // 2. If session exists, let them pass
  if (session) {
    return true;
  }

  // 3. If no session, redirect to login page
  return router.parseUrl('/login');
};
