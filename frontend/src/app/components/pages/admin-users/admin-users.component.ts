import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  adminService = inject(AdminService);

  users: any[] = [];
  pendingUsers: any[] = [];
  
  activeTab: 'all' | 'pending' = 'all';
  
  // For editing
  editingUser: any = null;
  editForm: any = {};

  // For creating
  showCreateForm = false;
  createForm: any = {
    role: 'turista',
    gender: 'M'
  };

  ngOnInit(): void {
    this.loadAllUsers();
    this.loadPendingUsers();
  }

  loadAllUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = res.users || [];
      },
      error: (err) => {
        alert('Greška pri učitavanju korisnika: ' + (err.error?.message || err.message));
      }
    });
  }

  loadPendingUsers() {
    this.adminService.getPendingUsers().subscribe({
      next: (res: any) => {
        this.pendingUsers = res.users || [];
      },
      error: (err) => {
        alert('Greška pri učitavanju pending korisnika: ' + (err.error?.message || err.message));
      }
    });
  }

  approveUser(userId: string) {
    if (!confirm('Da li ste sigurni da želite da odobrite ovog korisnika?')) return;
    
    this.adminService.approveUser(userId).subscribe({
      next: () => {
        alert('Korisnik uspešno odobren');
        this.loadAllUsers();
        this.loadPendingUsers();
      },
      error: (err) => {
        alert('Greška: ' + (err.error?.message || err.message));
      }
    });
  }

  rejectUser(userId: string) {
    if (!confirm('Da li ste sigurni da želite da odbijete ovog korisnika? Username i email će biti zabranjeni.')) return;
    
    this.adminService.rejectUser(userId).subscribe({
      next: () => {
        alert('Korisnik uspešno odbijen. Username i email su dodati na crnu listu.');
        this.loadAllUsers();
        this.loadPendingUsers();
      },
      error: (err) => {
        alert('Greška: ' + (err.error?.message || err.message));
      }
    });
  }

  deactivateUser(userId: string) {
    if (!confirm('Da li ste sigurni da želite da deaktivirate ovog korisnika?')) return;
    
    this.adminService.deactivateUser(userId).subscribe({
      next: () => {
        alert('Korisnik uspešno deaktiviran');
        this.loadAllUsers();
      },
      error: (err) => {
        alert('Greška: ' + (err.error?.message || err.message));
      }
    });
  }

  activateUser(userId: string) {
    this.adminService.activateUser(userId).subscribe({
      next: () => {
        alert('Korisnik uspešno aktiviran');
        this.loadAllUsers();
      },
      error: (err) => {
        alert('Greška: ' + (err.error?.message || err.message));
      }
    });
  }

  deleteUser(userId: string) {
    if (!confirm('Da li ste sigurni da želite trajno da obrišete ovog korisnika?')) return;
    
    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        alert('Korisnik uspešno obrisan');
        this.loadAllUsers();
      },
      error: (err) => {
        alert('Greška: ' + (err.error?.message || err.message));
      }
    });
  }

  startEdit(user: any) {
    this.editingUser = user;
    this.editForm = { ...user };
  }

  cancelEdit() {
    this.editingUser = null;
    this.editForm = {};
  }

  saveEdit() {
    const updates = {
      name: this.editForm.name,
      lastname: this.editForm.lastname,
      gender: this.editForm.gender,
      address: this.editForm.address,
      phone: this.editForm.phone,
      email: this.editForm.email,
      creditCard: this.editForm.creditCard,
      role: this.editForm.role
    };

    this.adminService.updateUser(this.editingUser._id, updates).subscribe({
      next: () => {
        alert('Korisnik uspešno ažuriran');
        this.cancelEdit();
        this.loadAllUsers();
      },
      error: (err) => {
        alert('Greška: ' + (err.error?.message || err.message));
      }
    });
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.createForm = { role: 'turista', gender: 'M' };
    }
  }

  createUser() {
    if (!this.createForm.username || !this.createForm.password || !this.createForm.email) {
      alert('Unesite obavezna polja: username, password, email');
      return;
    }

    this.adminService.createUser(this.createForm).subscribe({
      next: () => {
        alert('Korisnik uspešno kreiran');
        this.toggleCreateForm();
        this.loadAllUsers();
      },
      error: (err) => {
        alert('Greška: ' + (err.error?.message || err.message));
      }
    });
  }
}
