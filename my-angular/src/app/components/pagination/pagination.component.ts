import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() total = 0;
  @Input() perPage = 10;
  @Output() pageChange = new EventEmitter<number>();
  @Output() perPageChange = new EventEmitter<number>();

  get pages(): number { return Math.max(1, Math.ceil((this.total || 0) / (this.perPage || 1))); }
  prev(){ this.pageChange.emit(Math.max(1, this.page - 1)); }
  next(){ this.pageChange.emit(Math.min(this.pages, this.page + 1)); }
}
