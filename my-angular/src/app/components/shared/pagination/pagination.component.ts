import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() perPage = 10;
  @Output() pageChange = new EventEmitter<number>();
  @Output() perPageChange = new EventEmitter<number>();

  first() { if (this.page > 1) this.pageChange.emit(1); }
  prev()  { if (this.page > 1) this.pageChange.emit(this.page - 1); }
  next()  { if (this.page < this.totalPages) this.pageChange.emit(this.page + 1); }
  last()  { if (this.page < this.totalPages) this.pageChange.emit(this.totalPages); }

  onPerPage(val: string) {
    const n = Number(val) || 10;
    this.perPageChange.emit(n);
  }
}
