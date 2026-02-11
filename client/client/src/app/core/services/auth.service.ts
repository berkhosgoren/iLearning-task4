import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ApiService } from './api.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  private TOKEN_KEY = "jwt_token";

  private isBrowser(){
    return isPlatformBrowser(this.platformId);
  }

  register(data:any){
    return this.api.post('/auth/register', data);
  }

  login(data:any){
    return this.api.post('/auth/login', data);
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string) {
    if (!this.isBrowser()) return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  clearToken(){
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.TOKEN_KEY);
  }

  me(){
    return this.api.get('/auth/me');
  }
  
}
