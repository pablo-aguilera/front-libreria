import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  // contador de requests en curso
  active = signal(0);

  show() { this.active.update(v => v + 1); }
  hide() { this.active.update(v => Math.max(0, v - 1)); }
}
