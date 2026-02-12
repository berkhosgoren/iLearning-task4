import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private http = inject(HttpClient);

  private base = 'http://localhost:5242';

  get<T>(url:string): Observable<T> {
    return this.http.get<T>(this.base + url);
  }

  post<T>(url:string, body:any): Observable<T>{
    return this.http.post<T>(this.base + url, body);
  }
}
