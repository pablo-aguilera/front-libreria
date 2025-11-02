import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule],
  template: `
  <h1>Perfil</h1>
  <ng-container *ngIf="auth.user() as u">
    <p><strong>Nombre:</strong> {{u.name}}</p>
    <p><strong>Email:</strong> {{u.email}}</p>
    <p><strong>Rol:</strong> {{u.role}}</p>
  </ng-container>`,
})
export class ProfileComponent { auth = inject(AuthService); }
