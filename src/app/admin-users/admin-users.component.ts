import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';

interface User {
  id: string;
  name: string;
  email: string;
  joinedOn: string;
  status: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  toggleDropdown: boolean = false;
  activeMenu: string = 'Users';
  showUserEditModal: boolean = false;
  showDeleteModal: boolean = false;
  userToDeleteId: string | null = null;

  userSearchQuery: string = '';
  selectedStatusFilter: string = 'All';

  selectedUser: any = null;
  updatedStatusValue: string = '';

  usersList: any[] = [];
  filteredUsers: any[] = [];

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadMockUsers();
    this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        if (!users || users.length === 0) {
          this.loadMockUsers();
          return;
        }
        this.usersList = users.map(user => {
          // Map createdAt/created_at to joinedOn
          let joinedOn = '';
          if (user.createdAt) {
            joinedOn = new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
          } else if (user.created_at) {
            joinedOn = new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
          } else if (user.joinedOn) {
            joinedOn = user.joinedOn;
          } else if (user.joinedDate) {
            joinedOn = new Date(user.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
          } else {
            joinedOn = 'Recently';
          }

          const id = user.id || user._id || '';
          const status = user.status || 'Active';
          const name = user.name || user.email?.split('@')[0] || 'User';

          return {
            ...user,
            id,
            name,
            joinedOn,
            status
          };
        });
        this.filterUsers();
      },
      error: (err) => {
        console.warn('Failed to load users from API. Loading mock data.', err);
        this.loadMockUsers();
      }
    });
  }

  loadMockUsers(): void {
    this.usersList = [
      { id: '1', name: 'Rohit Sharma', email: 'rohit@example.com', joinedOn: 'Jan 15, 2026', status: 'Active' },
      { id: '2', name: 'Rahul Verma', email: 'rahul.v@example.com', joinedOn: 'Feb 10, 2026', status: 'Inactive' },
      { id: '3', name: 'Jacob Thomas', email: 'jacob@example.com', joinedOn: 'Mar 05, 2026', status: 'Active' },
      { id: '4', name: 'Arjun M', email: 'arjun@example.com', joinedOn: 'Apr 12, 2026', status: 'Active' },
      { id: '5', name: 'Anjali Sharma', email: 'anjali@example.com', joinedOn: 'May 01, 2026', status: 'Inactive' },
      { id: '6', name: 'Sneha Reddy', email: 'sneha@example.com', joinedOn: 'May 20, 2026', status: 'Active' },
      { id: '7', name: 'Dr. Amit', email: 'amit@example.com', joinedOn: 'Jun 10, 2026', status: 'Active' },
      { id: '8', name: 'Vikram Singh', email: 'vikram@example.com', joinedOn: 'Jun 22, 2026', status: 'Active' },
      { id: '9', name: 'Pooja Hegde', email: 'pooja@example.com', joinedOn: 'Jun 23, 2026', status: 'Active' },
      { id: '10', name: 'Karan Johar', email: 'karan@example.com', joinedOn: 'Jun 24, 2026', status: 'Active' }
    ];
    this.filterUsers();
  }

  filterUsers(): void {
    const query = this.userSearchQuery.trim().toLowerCase();
    const result = this.usersList.filter(user => {
      const name = user.name || '';
      const email = user.email || '';
      const matchesSearch = name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
      const matchesStatus = this.selectedStatusFilter === 'All' || (user.status && user.status.toLowerCase() === this.selectedStatusFilter.toLowerCase());
      return matchesSearch && matchesStatus;
    });
    // Force Inactive on top
    this.filteredUsers = result.sort((a, b) => {
      if (a.status === 'Inactive' && b.status !== 'Inactive') return -1;
      if (a.status !== 'Inactive' && b.status === 'Inactive') return 1;
      return 0;
    });
    this.cdr.detectChanges();
  }

  selectFilter(status: string): void {
    this.selectedStatusFilter = status;
    this.toggleDropdown = false;
    this.filterUsers();
  }

  openEditModal(user: any): void {
    this.selectedUser = user;
    this.updatedStatusValue = user.status;
    this.showUserEditModal = true;
  }

  onStatusRadioChange(status: string): void {
    this.updatedStatusValue = status;
  }

  saveUserStatus(): void {
    if (this.selectedUser) {
      // Optimistically update the UI
      const userIndex = this.usersList.findIndex(u => u.id === this.selectedUser.id);
      if (userIndex !== -1) {
        this.usersList[userIndex].status = this.updatedStatusValue;
        this.filterUsers();
      }

      this.adminService.updateUserStatus(this.selectedUser.id.toString(), this.updatedStatusValue).subscribe({
        next: () => this.loadAllUsers(),
        error: (err) => console.warn('Mock mode: Status updated locally.')
      });
    }
    this.showUserEditModal = false;
  }

  openDeleteConfirmation(userId: string): void {
    this.userToDeleteId = userId;
    this.showDeleteModal = true;
  }

  confirmDeleteUser(): void {
    if (this.userToDeleteId !== null) {
      // Optimistically update the UI
      this.usersList = this.usersList.filter(u => u.id !== this.userToDeleteId);
      this.filterUsers();

      this.adminService.deleteUser(this.userToDeleteId!.toString()).subscribe({
        next: () => this.loadAllUsers(),
        error: (err) => console.warn('Mock mode: User deleted locally.')
      });
    }
    this.showDeleteModal = false;
    this.userToDeleteId = null;
  }

  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
  }
}