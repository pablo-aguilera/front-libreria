import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [
  // Base
  { path: '', redirectTo: 'books', pathMatch: 'full' },

  // Público
  {
    path: 'books',
    loadComponent: () =>
      import('./features/books/books.component').then(m => m.BooksComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },

  // Estudiante (solo student)
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard(['student'])],
    loadComponent: () =>
      import('./features/user-dashboard/user-dashboard.component').then(
        m => m.UserDashboardComponent
      ),
  },
  {
    path: 'my-loans',
    canActivate: [authGuard, roleGuard(['student'])],
    loadComponent: () =>
      import('./features/my-loans/my-loans.component').then(
        m => m.MyLoansComponent
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard], // perfil para cualquier autenticado
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        m => m.ProfileComponent
      ),
  },

  // Admin (solo admin)
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin-dashboard/admin-dashboard.component').then(
        m => m.AdminDashboardComponent
      ),
  },
  {
    path: 'admin/books',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/book-admin/book-admin.component').then(
        m => m.BookAdminComponent
      ),
  },
  {
    path: 'admin/loans',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/loans-admin/loans-admin.component').then(
        m => m.LoansAdminComponent
      ),
  },
  // 👉 NUEVA ruta: Administración de Usuarios
  {
    path: 'admin/users',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/users-admin/users-admin.component').then(
        m => m.UsersAdminComponent
      ),
  },

  // Fallback
  { path: '**', redirectTo: 'books' },
];
