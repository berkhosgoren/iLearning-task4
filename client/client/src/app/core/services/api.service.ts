import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private http = inject(HttpClient);

  private base = 'http://localhost:5242';

  private getHeaders(){
    const token = localStorage.getItem('jwt_token');

    if(!token) return {};

    return {
      headers: new HttpHeaders({
        Authorization: 'Bearer ${token}'
      })
    };
  }
  
  get(url:string){
    return this.http.get(this.base + url, this.getHeaders());
  }

  post(url:string, body:any){
    return this.http.post(this.base + url, body, this.getHeaders());
  }
}
