import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpEvent,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { ToastService } from '../shared/toast.service';
import { AuthService } from './auth.service';

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);
  const router = inject(Router);

  // Adjunta token si existe
  const token = auth.token();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const msg =
        (err?.error as any)?.error ??
        (err?.error as any)?.message ??
        err?.message ??
        'Error de comunicación';

      if (err.status === 401) {
        toast.error('Sesión expirada. Ingresa nuevamente.');
        auth.clear(); // redirige a /login
      } else if (err.status === 403) {
        toast.error('No tienes permisos para esta acción.');
        router.navigate(['/']);
      } else if (err.status === 404) {
        toast.error('Recurso no encontrado.');
      } else {
        toast.error(msg);
      }

      return throwError(() => err);
    })
  );
};
