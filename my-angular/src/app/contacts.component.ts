import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { ModalComponent } from './modal.component';
import { PaginationComponent } from './pagination.component';

type Contact = { id:number|string; name:string; artist:string; album:string; year:number };


@Component({
  standalone: true,
  selector: 'app-contacts',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, ModalComponent, PaginationComponent],
  template: `
  <main class="music-wrap">
    <header><div><h1>Музична колекція</h1><p>Лабораторна робота №5 · Варіант 12</p></div><button type="button" (click)="newItem()">+ Додати пісню</button></header>
    <section class="panel">
      <div class="toolbar"><label>Пошук <input [(ngModel)]="searchQ" (ngModelChange)="applySearch()" placeholder="Назва пісні або альбом" /></label>
        <label>Виконавець <select [(ngModel)]="filterArtist" (ngModelChange)="applySearch()"><option value="">Усі виконавці</option><option *ngFor="let artist of artists" [value]="artist">{{ artist }}</option></select></label>
        <label>Сортування <select [(ngModel)]="sortBy"><option value="name">Назва</option><option value="artist">Виконавець</option><option value="album">Альбом</option><option value="year">Рік</option></select></label>
        <button type="button" (click)="sortDir = sortDir === 'asc' ? 'desc' : 'asc'">{{sortDir === 'asc' ? '↑ За зростанням' : '↓ За спаданням'}}</button>
      </div>
    </section>
    <section class="panel"><h2>{{isEdit ? 'Редагування пісні' : 'Додати нову пісню'}}</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="song-form">
        <label>Назва пісні *<input formControlName="name" placeholder="Наприклад, Обійми" /></label>
        <label>Виконавець *<input formControlName="artist" placeholder="Наприклад, Океан Ельзи" /></label>
        <label>Альбом *<input formControlName="album" placeholder="Назва альбому" /></label>
        <label>Рік *<input type="number" formControlName="year" min="1900" max="2100" /></label>
        <p class="error" *ngIf="form.invalid && form.touched">Заповніть усі поля. Рік має бути від 1900 до 2100.</p>
        <div class="actions"><button type="submit" [disabled]="loading">{{isEdit ? 'Зберегти зміни' : 'Додати пісню'}}</button><a *ngIf="isEdit" routerLink="/songs">Скасувати</a></div>
      </form>
    </section>
    <section class="panel"><h2>Список пісень <span class="count">{{total}}</span></h2>
      <div class="table-scroll"><table><thead><tr><th (click)="toggleSort('name')">Назва пісні ↕</th><th (click)="toggleSort('artist')">Виконавець ↕</th><th (click)="toggleSort('album')">Альбом ↕</th><th (click)="toggleSort('year')">Рік ↕</th><th>Дії</th></tr></thead>
      <tbody><tr *ngFor="let item of paged"><td><strong>{{item.name}}</strong></td><td>{{item.artist}}</td><td>{{item.album}}</td><td>{{item.year}}</td><td><a [routerLink]="['/songs', item.id, 'edit']">Редагувати</a> <button type="button" class="danger" (click)="askDelete(item)">Видалити</button></td></tr>
      <tr *ngIf="!paged.length"><td colspan="5">Пісень не знайдено</td></tr></tbody></table></div>
      <app-pagination [page]="page" [total]="total" [perPage]="perPage" (pageChange)="setPage($event)" (perPageChange)="setPerPage($event)"></app-pagination>
    </section>
    <app-modal [open]="confirmOpen" title="Підтвердження видалення" (close)="confirmOpen=false" (confirm)="confirmDelete()">Видалити пісню <strong>{{toDelete?.name}}</strong>?</app-modal>
  </main>
  `,
  styles: [`
    :host{display:block;background:#f5f5fa;min-height:100vh;color:#202035;font-family:Arial,sans-serif}.music-wrap{max-width:1100px;margin:auto;padding:32px 20px}header{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:24px}h1{font-size:32px;margin:0}header p{color:#666}h2{font-size:19px;margin:0 0 20px}.panel{background:white;border-radius:14px;padding:24px;margin:18px 0;box-shadow:0 2px 12px #2020350b}.toolbar,.song-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;align-items:end}label{display:flex;flex-direction:column;gap:8px;font-weight:600;font-size:13px}input,select{box-sizing:border-box;width:100%;padding:11px;border:1px solid #d8d8e5;border-radius:8px;background:white;font:inherit}button{border:0;border-radius:8px;background:#5446d8;color:white;padding:12px 17px;cursor:pointer;font-weight:600}button:disabled{opacity:.5}.actions{grid-column:1/-1;display:flex;align-items:center;gap:16px}.error{grid-column:1/-1;color:#c72b45;margin:0}a{color:#5141c8;text-decoration:none;font-weight:600}.count{font-size:14px;color:#777}.table-scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:15px 12px;border-bottom:1px solid #eee}th{cursor:pointer;color:#626277;font-size:13px}td{font-size:14px}.danger{background:#fff1f2;color:#c52b45;margin-left:10px;padding:8px 10px}@media(max-width:800px){.toolbar,.song-form{grid-template-columns:1fr 1fr}}@media(max-width:520px){.toolbar,.song-form{grid-template-columns:1fr}header{align-items:flex-start;flex-direction:column}}
  `]
})
export class ContactsComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  items: Contact[] = [];
  loading = false;
  searchQ = '';
  filterArtist = '';
  page = 1;
  perPage = 5;
  sortBy: 'name'|'artist'|'album'|'year' = 'name';
  sortDir: 'asc'|'desc' = 'asc';
  form = this.fb.group({
    name: ['', Validators.required],
    artist: ['', Validators.required],
    album: ['', Validators.required],
    year: [2024, [Validators.required, Validators.min(1900), Validators.max(2100)]]
  });
  get isEdit() { return !!this.route.snapshot.paramMap.get('id'); }
  ngOnInit() { this.route.paramMap.subscribe(() => { void this.load(); }); }
  private parseId() { return this.route.snapshot.paramMap.get('id'); }
  async load() {
    this.loading = true;
    try {
      this.items = await firstValueFrom(this.api.listContacts());
      const id = this.parseId();
      if (id !== null) {
        const item = this.items.find(x => String(x.id) === id);
        if (item) this.form.patchValue({name:item.name, artist:item.artist, album:item.album, year:item.year});
        else void this.router.navigate(['/songs']);
      } else this.form.reset({name:'',artist:'',album:'',year:2024});
    } catch (error) { console.error('Помилка завантаження пісень', error); }
    finally { this.loading = false; }
  }
  newItem() { this.form.reset({name:'',artist:'',album:'',year:2024}); void this.router.navigate(['/songs']); }
  applySearch() { this.page = 1; }
  setPage(n:number) { this.page=n; }
  setPerPage(n:number) { this.perPage=n; this.page=1; }
  confirmOpen=false;
  toDelete?:Contact;
  askDelete(item:Contact) { this.toDelete=item; this.confirmOpen=true; }
  async confirmDelete() {
    if (!this.toDelete) return;
    try { await firstValueFrom(this.api.removeContact(this.toDelete.id)); this.confirmOpen=false; this.toDelete=undefined; await this.load(); }
    catch(error) { console.error('Помилка видалення',error); alert('Не вдалося видалити пісню'); }
  }
  toggleSort(key:'name'|'artist'|'album'|'year') {
    if(this.sortBy===key) this.sortDir=this.sortDir==='asc'?'desc':'asc';
    else {this.sortBy=key;this.sortDir='asc';}
  }
  get artists() { return [...new Set(this.items.map(x=>x.artist))].sort((a,b)=>a.localeCompare(b,'uk')); }
  get filtered() {
    const q=this.searchQ.trim().toLowerCase();
    return this.items.filter(x=>(!this.filterArtist || x.artist===this.filterArtist) && (!q || [x.name,x.album,x.artist].some(v=>v.toLowerCase().includes(q))));
  }
  get sorted() {
    return [...this.filtered].sort((a,b)=>{
      const result=this.sortBy==='year' ? a.year-b.year : String(a[this.sortBy]).localeCompare(String(b[this.sortBy]),'uk');
      return this.sortDir==='asc'?result:-result;
    });
  }
  get total(){return this.sorted.length;}
  get paged(){return this.sorted.slice((this.page-1)*this.perPage,this.page*this.perPage);}
  async onSubmit(){
    if(this.form.invalid){this.form.markAllAsTouched();return;}
    // const payload=this.form.getRawValue();
    const id=this.parseId();
    const payload = {
      name: this.form.value.name ?? '',
      artist: this.form.value.artist ?? '',
      album: this.form.value.album ?? '',
      year: this.form.value.year ?? 0,
    };
    try {
      if(id!==null){await firstValueFrom(this.api.updateContact(id,payload)); await this.router.navigate(['/songs']);}
      else {await firstValueFrom(this.api.createContact(payload)); await this.load();}
    } catch(error){console.error('Помилка збереження',error);alert('Не вдалося зберегти пісню');}
  }
}
