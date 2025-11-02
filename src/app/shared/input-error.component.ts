import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
@Component({
  standalone: true,
  selector: 'app-input-error',
  imports: [CommonModule],
  template: `
    <div *ngIf="control?.invalid && (control?.dirty || control?.touched)" class="err" role="alert" aria-live="polite">
      <span *ngIf="control?.errors?.['required']">Este campo es obligatorio.</span>
      <span *ngIf="control?.errors?.['email']">Formato de email inválido.</span>
      <span *ngIf="control?.errors?.['minlength']">Mínimo {{control?.errors?.['minlength']?.requiredLength}} caracteres.</span>
      <span *ngIf="control?.errors?.['min']">Valor mínimo inválido.</span>
    </div>`,
  styles: [`.err{color:#B00020;font-size:12px;margin-top:4px}`]
})
export class InputErrorComponent { @Input() control?: AbstractControl | null; }
