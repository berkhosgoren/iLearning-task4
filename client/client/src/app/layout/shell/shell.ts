import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {

  private auth = inject(AuthService);
  private router = inject(Router);

  get isLoggedIn() {
    return !!this.auth.getToken();
  }

  logout() {
    this.auth.clearToken();
    this.router.navigate(['/login']);
  }

}
