import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { ToastService } from '../shared/toast.service';
import { LoaderService } from '../shared/loader.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const loader = inject(LoaderService);

  const token = auth.token();
  const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  loader.show();

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        toast.error('Tu sesión expiró. Inicia sesión de nuevo.');
        auth.clear(); // redirige a /login
      } else if (err.status === 403) {
        toast.error('No tienes permisos para esta acción.');
      }
      return throwError(() => err);
    }),
    finalize(() => loader.hide())
  );
};
