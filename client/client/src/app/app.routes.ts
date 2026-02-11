import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Users } from './features/users/users/users';

export const routes: Routes = [
    { path: '', component: Login},
    { path: 'login', component: Login},
    { path: 'register', component: Register},
    { path: 'users', component: Users},
];
