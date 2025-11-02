import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

const ICONS: Record<string, string> = {
  book: 'M3 5a2 2 0 0 1 2-2h9a3 3 0 0 1 3 3v11.5a.5.5 0 0 1-.8.4L12 15l-4.2 2.9a.5.5 0 0 1-.8-.4V6a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2Z',
  login: 'M12 2a1 1 0 0 1 1 1v6h2l-3 3-3-3h2V3a1 1 0 0 1 1-1Zm6 10v5a2 2 0 0 1-2 2H8a1 1 0 1 1 0-2h8v-5a1 1 0 1 1 2 0Z',
  logout: 'M13 3a1 1 0 0 0-1 1v6H9l3 3 3-3h-3V4a1 1 0 0 0-1-1ZM5 5a2 2 0 0 0-2 2v10h10a1 1 0 1 0 0-2H5V7a2 2 0 0 0-2-2Z',
  user: 'M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM2 14a6 6 0 0 1 12 0v2H2v-2Z',
  shield: 'M4 3.5 10 2l6 1.5V10c0 3.3-2 6.2-6 8-4-1.8-6-4.7-6-8V3.5Z',
  search: 'M11 11l4 4-1 1-4-4v-.7A5.3 5.3 0 1 1 11 11Zm-4.7.6a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  plus: 'M8 2h2v6h6v2H10v6H8V10H2V8h6V2Z',
  edit: 'M3 13.5V16h2.5L14 7.5 11.5 5 3 13.5ZM16 4l-1.5-1.5a1 1 0 0 0-1.4 0L11.6 4 14 6.4 16 4Z',
  trash: 'M6 7h8v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7Zm1-3h6l1 1h3v2H3V5h3l1-1Z',
  arrowL: 'M13 5l-5 5 5 5V5Z',
  arrowR: 'M7 5l5 5-5 5V5Z',
};

@Component({
  standalone: true,
  selector: 'app-icon',
  imports: [CommonModule],
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path [attr.d]="ICONS[name] || ICONS['book']"></path>
    </svg>
  `,
})
export class IconComponent {
  ICONS = ICONS;
  @Input() name: keyof typeof ICONS = 'book';
  @Input() size = 18;
}
