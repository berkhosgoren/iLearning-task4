import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private http = inject(HttpClient);

  private base = 'http://localhost:5242';

  get(url:string){
    return this.http.get(this.base + url);
  }

  post(url:string, body:any){
    return this.http.post(this.base + url, body);
  }
}
