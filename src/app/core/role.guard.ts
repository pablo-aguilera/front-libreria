import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, type Role } from './auth.service';

/**
 * Uso: canActivate: [authGuard, roleGuard(['admin'])]
 * Si el rol no coincide, redirige:
 *  - admin -> /admin
 *  - student -> /dashboard
 */
export const roleGuard = (allowed: Role[]): CanActivateFn => {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // No autenticado -> login
    if (!auth.isLoggedIn()) {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const role = auth.role();
    if (role && allowed.includes(role)) return true;

    // Redirección por rol equivocado
    if (role === 'admin') {
      router.navigate(['/admin']);
    } else {
      router.navigate(['/dashboard']);
    }
    return false;
  };
};
