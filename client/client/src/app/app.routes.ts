import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Users } from './features/users/users/users';
import { authGuard } from './core/guards/auth-guard';
import { startGuard } from './core/guards/start-guard';


export const routes: Routes = [
    { path: '', canActivate: [startGuard], component: Login},
    { path: 'login', component: Login},
    { path: 'register', component: Register},
    { path: 'users', component: Users, canActivate:[authGuard]},
    { path: '**', redirectTo: ''},
];
