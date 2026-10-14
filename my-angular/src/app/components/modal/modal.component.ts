import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  onBackdrop(e: MouseEvent) { this.close.emit(); }
  stop(e: MouseEvent) { e.stopPropagation(); }
}
