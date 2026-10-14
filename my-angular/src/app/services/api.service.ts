import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact, Group } from '../models/models';

const BASE = 'http://localhost:5174';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  listContactsRaw(params: { q?: string; groupId?: string|number|null } = {}): Observable<Contact[]> {
    let httpParams = new HttpParams();
    if (params.q) httpParams = httpParams.set('q', String(params.q));
    if (params.groupId !== undefined && params.groupId !== null && params.groupId !== '')
      httpParams = httpParams.set('groupId', String(params.groupId));
    return this.http.get<Contact[]>(`${BASE}/contacts`, { params: httpParams });
  }

  getContact(id: string|number): Observable<Contact> {
    return this.http.get<Contact>(`${BASE}/contacts/${id}`);
  }

  createContact(payload: Partial<Contact>): Observable<Contact> {
    return this.http.post<Contact>(`${BASE}/contacts`, payload);
  }
  updateContact(id: string|number, payload: Partial<Contact>): Observable<Contact> {
    return this.http.patch<Contact>(`${BASE}/contacts/${id}`, payload);
  }
  removeContact(id: string|number): Observable<void> {
    return this.http.delete<void>(`${BASE}/contacts/${id}`);
  }
  listGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${BASE}/groups`);
  }
}
