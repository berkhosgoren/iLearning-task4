import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  private auth = inject(AuthService);

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
        this.message = 'Login success';
      },
      error:(err)=>{
        this.message = err.error?.message ?? 'Error';
      }
    });
  }
}
