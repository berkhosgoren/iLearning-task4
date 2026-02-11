import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class Users  implements OnInit{

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  list:any[] = [];

  ngOnInit(): void {
    this.api.get('/users').subscribe({
      next:(res:any)=>{
        this.list = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }
}
