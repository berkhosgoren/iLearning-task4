import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  message = '';

  login(){

    this.auth.login({
      email:this.email,
      password:this.password
    }).subscribe({
      next:(res:any)=>{

        this.auth.setToken(res.token);

        this.auth.me().subscribe({
          next: () => {
            this.message = 'Login success';
            this.router.navigate(['/users']);
          },
          error: () => {
            this.auth.clearToken();
            this.message = 'Session validation failed.';
          }
        });
      },
      error:(err)=>{
        this.message = err.error?.message ?? 'Error';
      }
    });
  }
}
