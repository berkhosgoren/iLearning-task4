import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';


export const startGuard: CanActivateFn = () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getToken()) {
    return router.parseUrl('/users');
  }

  return router.parseUrl('/login');

};
