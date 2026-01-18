import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard'; // Ensure you've created this guard
import { Masters } from './pages/masters/masters';

export const routes: Routes = [
  // 1. Default Route (Redirect to Login)
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 2. Login Route (Lazy Loaded)
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    // title: 'Login - HMS Portal',
  },

  // 3. Dashboard Parent Route (Using the Shell Layout)
  {
    path: 'dashboard',
    canActivate: [authGuard], // Protects all hospital data
    loadComponent: () =>
      import('./layout/dashboard-shell/dashboard-shell').then((m) => m.DashboardShell),
    children: [
      // { path: '', redirectTo: 'staff', pathMatch: 'full' },
      // Master Data Forms (Designation, Dept, etc.)
      {
        path: 'masters',
        loadComponent: () => import('./pages/masters/masters').then((m) => m.Masters),
      },
      // The Core 8 Hospital Forms
      {
        path: 'patients',
        loadComponent: () => import('./pages/patients/patients').then((m) => m.Patients),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./pages/appointments/appointments').then((m) => m.Appointments),
      },
      {
        path: 'billing',
        loadComponent: () => import('./pages/billing/billing').then((m) => m.Billing),
      },
      {
        path: 'inventory',
        loadComponent: () => import('./pages/inventory/inventory').then((m) => m.Inventory),
      },
      {
        path: 'pharmacy',
        loadComponent: () => import('./pages/pharmacy/pharmacy').then((m) => m.Pharmacy),
      },
      {
        path: 'laboratory',
        loadComponent: () =>
          import('./pages/laborartory/laborartory').then((m) => m.LaboratoryComponent),
      },
      {
        path: 'staff',
        loadComponent: () => import('./pages/staffs/staffs').then((m) => m.Staffs),
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports').then((m) => m.Reports),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'stats',
        loadComponent: () => import('./pages/stats/stats').then((m) => m.Stats),
      },
      {
        path: 'infrastructure',
        loadComponent: () =>
          import('./pages/infrastructure/infrastructure').then((m) => m.Infrastructure),
      },
      {
        path: 'configurations',
        loadComponent: () =>
          import('./pages/configurations/configurations').then((m) => m.Configurations),
      },
      {
        path: 'bulkimports',
        loadComponent: () => import('./pages/bulkimports/bulkimports').then((m) => m.Bulkimports),
      },
      {
        path: 'stockmapview',
        loadComponent: () =>
          import('./pages/stockmapview/stockmapview').then((m) => m.Stockmapview),
      },
      {
        path: 'admincalendar',
        loadComponent: () =>
          import('./pages/admincalendar/admincalendar').then((m) => m.Admincalendar),
      },
      {
        path: 'tests',
        loadComponent: () => import('./pages/tests/tests').then((m) => m.Tests),
      },
      { path: '**', redirectTo: 'login' },
    ],
  },
  // 4. Wildcard Route (404 Page)
  { path: '**', redirectTo: 'login' },
];
