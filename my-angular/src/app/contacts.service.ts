import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  group?: string; // group id
}

export interface Group { id: string; name: string; }

const LS_KEY = 'lab.contacts';

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private groupsData: Group[] = [
    { id: 'work', name: 'Work' },
    { id: 'family', name: 'Family' },
    { id: 'friends', name: 'Friends' },
  ];

  private read(): Contact[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) as Contact[] : [];
    } catch {
      return [];
    }
  }
  private write(list: Contact[]) {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  }

  list(): Observable<Contact[]> { return of(this.read()); }
  get(id: string): Observable<Contact | undefined> { return of(this.read().find(c => c.id === id)); }
  upsert(payload: Partial<Contact> & { id?: string }): Observable<Contact> {
    const list = this.read();
    const id = payload.id ?? crypto.randomUUID();
    const idx = list.findIndex(c => c.id === id);
    const merged: Contact = { id, name: payload.name?.trim() || 'Unnamed', email: payload.email, phone: payload.phone, group: payload.group };
    if (idx >= 0) list[idx] = merged; else list.unshift(merged);
    this.write(list);
    return of(merged);
  }
  remove(id: string): Observable<void> {
    const list = this.read().filter(c => c.id !== id);
    this.write(list);
    return of(void 0);
  }
  groups(): Observable<Group[]> { return of(this.groupsData); }
}
