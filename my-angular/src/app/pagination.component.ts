import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div style="display:flex; align-items:center; justify-content:space-between; margin-top:12px; gap:12px;">
    <div>
      <button [disabled]="page<=1" (click)="pageChange.emit(1)">« First</button>
      <button [disabled]="page<=1" (click)="pageChange.emit(page-1)">‹ Prev</button>
      <span style="margin:0 8px">Page {{ page }} / {{ totalPages }}</span>
      <button [disabled]="page>=totalPages" (click)="pageChange.emit(page+1)">Next ›</button>
      <button [disabled]="page>=totalPages" (click)="pageChange.emit(totalPages)">Last »</button>
    </div>
    <div>
      <label>Per page: </label>
      <select [value]="perPage" (change)="perPageChange.emit(+$any($event.target).value)">
        <option *ngFor="let n of perPageOptions" [value]="n">{{ n }}</option>
      </select>
    </div>
  </div>
  `
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() perPage = 5;
  @Input() total = 0;
  @Output() pageChange = new EventEmitter<number>();
  @Output() perPageChange = new EventEmitter<number>();

  perPageOptions = [5,10,20,50,100];
  get totalPages(){ return Math.max(1, Math.ceil(this.total / this.perPage)); }
}
