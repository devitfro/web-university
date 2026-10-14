import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Contact, Group } from '../../models/models';
import { ModalComponent } from '../modal/modal.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalComponent, PaginationComponent],
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.css']
})
export class ContactsListComponent implements OnInit {
  q = '';
  groupId: string|number|'' = '';
  groups: Group[] = [];
  rawItems: Contact[] = [];
  items: Contact[] = [];
  total = 0;
  page = 1;
  perPage = 10;

  confirmOpen = false;
  toDelete: Contact | null = null;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(){ this.loadGroups(); this.load(); }

  private applyFilters(){
    let data = [...this.rawItems];
    if (this.q){
      const q = this.q.toLowerCase();
      data = data.filter(x => 
        (x.name && x.name.toLowerCase().includes(q)) ||
        (x as any).email?.toLowerCase?.().includes(q) ||
        (x as any).phone?.toLowerCase?.().includes(q)
      );
    }
    if (this.groupId !== '' && this.groupId !== null && this.groupId !== undefined){
      data = data.filter(x => String((x as any).groupId ?? '') === String(this.groupId));
    }
    this.total = data.length;
    const start = (this.page - 1) * this.perPage;
    this.items = data.slice(start, start + this.perPage);
  }

  load(){ 
    this.api.listContactsRaw().subscribe(res => { this.rawItems = res; this.applyFilters(); });
  }
  loadGroups(){ this.api.listGroups().subscribe(gs => this.groups = gs); }

  search(){ this.page = 1; this.applyFilters(); }
  reset(){ this.q=''; this.groupId=''; this.page=1; this.applyFilters(); }

  groupNameOf(id: any){ return this.groups.find(g => String(g.id)===String(id))?.name || '—'; }

  openEdit(id: string|number){ this.router.navigate(['/contacts', id, 'edit']); }
  create(){ this.router.navigate(['/contacts', 'new', 'edit']); }

  askDelete(item: Contact){ this.toDelete = item; this.confirmOpen = true; }
  doDelete(){ if (!this.toDelete) return; this.api.removeContact(this.toDelete.id).subscribe(()=>{ this.confirmOpen=false; this.load(); }); }
}
