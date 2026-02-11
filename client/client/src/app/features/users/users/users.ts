import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRow, UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})

export class Users implements OnInit{

  private usersApi = inject(UsersService);

  list: UserRow[] = [];
  selected = new Set<string>();
  message = '';
  busy = false;

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.message = '';
    this.usersApi.list().subscribe({
      next: (res) => {
        this.list = res ?? [];
        this.selected.clear();
      },
      error: (err) => {
        console.error(err);
        this.message = err?.error?.message ?? 'Failed to load users.';
      }
    });
 }

 isSelected(id: string) {
  return this.selected.has(id);
 }

 toggleOne(id: string, checked: boolean) {
  if (checked) this.selected.add(id);
  else this.selected.delete(id);
 }

 togleAll(checked: boolean) {
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
  this.usersApi.block(this.selectedIds).subscribe({
    next: (res: any) => {
      this.message = res?.message ?? 'Users blocked.';
      this.busy = false;
      this.refresh();
    },
    error: (err) => {
      this.busy = false;
      this.message = err?.error?.message ?? 'Failed to block users.';
    }
  });
 }

 unblockSelected(){
  if (this.selectedCount === 0) return;
  
  this.busy = true;
  this.usersApi.unblock(this.selectedIds).subscribe({
    next: (res: any) => {
      this.message = res?.message ?? 'Users unblocked.';
      this.busy = false;
      this.refresh();
    },
    error: (err) => {
      this.busy = false;
      this.message = err?.error?.message ?? 'Failed to unblock users.';
    }
  });
}

deleteSelected() {
  if (this.selectedCount === 0) return;
  if (!confirm(`Delete ${this.selectedCount} user(s)?`)) return;

  this.busy = true;
  this.usersApi.delete(this.selectedIds).subscribe({
    next: (res: any) => {
      this.message = res?.message ?? "Users deleted.";
      this.busy = false;
      this.refresh();
    },
    error: (err) => {
      this.busy = false;
      this.message = err?.error?.message ?? 'Failed to delete users.';
    }
  });
}

deleteUnverified() {
  if (!confirm('Delete ALL unverified users?')) return;

  this.busy = true;
  this.usersApi.deleteUnverified().subscribe({
    next: (res: any) => {
      this.message = res?.message ?? 'Unverified users deleted.';
      this.busy = false;
      this.refresh();
    },
    error: (err) => {
      this.busy = false;
      this.message = err?.error?.message ?? 'Failed to delete unverified users.';
    }
  });
}

}
