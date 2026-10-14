import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  styles: [`
  .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; }
  .dialog { background: #fff; padding: 16px; border-radius: 8px; margin: 20px; max-width: 90vw; box-shadow: 0 10px 30px rgba(0,0,0,.2); }
  `],
  template: `
  <div *ngIf="open" class="backdrop" (click)="onBackdrop()">
    <div class="dialog" role="dialog" [attr.aria-label]="title" (click)="$event.stopPropagation()">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
        <h3 style="margin:0">{{ title }}</h3>
        <button (click)="close.emit()">×</button>
      </div>
      <div class="content">
        <ng-content></ng-content>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
        <button (click)="close.emit()">Скасувати</button>
        <button (click)="confirm.emit()">Видалити</button>
      </div>
    </div>
  </div>
  `
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = 'Confirm';
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onBackdrop(){ this.close.emit(); }
}
