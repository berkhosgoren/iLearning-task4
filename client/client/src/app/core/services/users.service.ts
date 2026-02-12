import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export type UserRow ={
  id: string;
  name: string;
  email: string;
  status: string;
  createdAtUtc?: string;
  lastLoginAtUtc?: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private api = inject(ApiService);

  list() {
    return this.api.get<UserRow[]>('/users');
  }

  block(ids: string[]) {
    return this.api.post('/users/block', { ids });
  }

  unblock(ids: string[]) {
    return this.api.post('/users/unblock', { ids });
  }
  
  delete(ids: string[]) {
    return this.api.post('/users/delete', { ids });
  }

  deleteUnverified() {
    return this.api.post('/users/delete-unverified', { ids: [] });
  }
}
