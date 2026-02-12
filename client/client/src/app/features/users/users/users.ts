import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRow, UsersService } from '../../../core/services/users.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})

export class Users implements OnInit{

  private usersApi = inject(UsersService);
  private cd = inject(ChangeDetectorRef);

  private router = inject(Router);
  private auth = inject(AuthService);

  list: UserRow[] = [];
  selected = new Set<string>();
  message = '';
  busy = false;

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.message = '';
    this.busy = true;

    this.usersApi.list()
    .pipe(finalize(() => (this.busy = false)))
    .subscribe({
      next: (res) => {
        this.list = res ?? [];
        this.selected.clear();
        queueMicrotask(() => this.cd.detectChanges());
              },
      error: (err) => {
        console.error(err);
          this.message = err?.error?.message ?? 'Failed to load users.';   
          queueMicrotask(() => this.cd.detectChanges());
      },
    });
 }

 isSelected(id: string) {
  return this.selected.has(id);
 }

 toggleOne(id: string, checked: boolean) {
  if (checked) this.selected.add(id);
  else this.selected.delete(id);
 }

 toggleAll(checked: boolean) {
  this.selected.clear();
  if (checked) {
    for (const u of this.list) this.selected.add(u.id);
  }
 }

 get selectedCount() {
  return this.selected.size;
 }

 private get selectedIds() {
  return Array.from(this.selected);
 }

 blockSelected() {
  if (this.selectedCount === 0) return;

  this.busy = true;
  this.usersApi.block(this.selectedIds)
  .pipe(finalize(() => (this.busy = false)))
  .subscribe({
    next: (res: any) => {
      this.message = res?.message ?? 'Users blocked.';
      this.refresh();
      queueMicrotask(() => this.cd.detectChanges());
    },
    error: (err) => {
      this.message = err?.error?.message ?? 'Failed to block users.';
      queueMicrotask(() => this.cd.detectChanges());
    }
  });
 }

 unblockSelected(){
  if (this.selectedCount === 0) return;
  
  this.busy = true;
  this.usersApi.unblock(this.selectedIds)
  .pipe(finalize(() => (this.busy = false)))
  .subscribe({
    next: (res: any) => {
      this.message = res?.message ?? 'Users unblocked.';
      this.refresh();
      queueMicrotask(() => this.cd.detectChanges());
    },
    error: (err) => {
      this.message = err?.error?.message ?? 'Failed to unblock users.';
      queueMicrotask(() => this.cd.detectChanges());
    }
  });
}

deleteSelected() {
  if (this.selectedCount === 0) return;
  if (!confirm(`Delete ${this.selectedCount} user(s)?`)) return;

  this.busy = true;
  this.usersApi.delete(this.selectedIds)
  .pipe( finalize(() => (this.busy = false)))
  .subscribe({
    next: (res: any) => {
      this.message = res?.message ?? "Users deleted.";
      this.refresh();
      queueMicrotask(() => this.cd.detectChanges());
    },
    error: (err) => {
      this.message = err?.error?.message ?? 'Failed to delete users.';
      queueMicrotask(() => this.cd.detectChanges());
    }
  });
}

deleteUnverified() {
  if (!confirm('Delete ALL unverified users?')) return;

  this.busy = true;
  this.usersApi.deleteUnverified()
  .pipe(finalize(() => (this.busy = false)))
  .subscribe({
    next: (res: any) => {
      this.message = res?.message ?? 'Unverified users deleted.';
      this.refresh();
      queueMicrotask(() => this.cd.detectChanges());
    },
    error: (err) => {
      this.message = err?.error?.message ?? 'Failed to delete unverified users.';
      queueMicrotask(() => this.cd.detectChanges());
    }
  });
}
}
