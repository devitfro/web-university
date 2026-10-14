import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Song { id: string|number; name:string; artist:string; album:string; year:number; }
@Injectable({providedIn:'root'})
export class ApiService {
  private http=inject(HttpClient);
  private base='http://localhost:5174/songs';
  listContacts(params:Record<string,string>={}):Observable<Song[]> {
    let p=new HttpParams();
    Object.entries(params).forEach(([key,value])=>p=p.set(key,value));
    return this.http.get<Song[]>(this.base,{params:p});
  }
  createContact(payload:Omit<Song,'id'>){return this.http.post<Song>(this.base,payload);}
  updateContact(id:string|number,payload:Omit<Song,'id'>){return this.http.patch<Song>(`${this.base}/${id}`,payload);}
  removeContact(id:string|number){return this.http.delete<void>(`${this.base}/${id}`);}
}
