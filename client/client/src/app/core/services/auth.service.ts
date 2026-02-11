import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private api = inject(ApiService);

  private TOKEN_KEY = "jwt_token";

  register(data:any){
    return this.api.post('/auth/register', data);
  }

  login(data:any){
    return this.api.post('/auth/login', data);
  }

  setToken(token:string){
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(){
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(){
    localStorage.removeItem(this.TOKEN_KEY);
  }

  me(){
    return this.api.get('/auth/me');
  }
  
}
