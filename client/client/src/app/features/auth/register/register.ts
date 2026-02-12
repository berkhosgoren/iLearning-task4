import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  message = '';

  register(){
    this.auth.register({
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.message = 'Registered. Confirm your email.';
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.message = err.error?.message ?? 'Error';
      }
    });
  }
}
