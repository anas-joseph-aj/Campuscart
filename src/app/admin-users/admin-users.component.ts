import { Component, OnInit } from '@angular/core';
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
  showUserEditModal: boolean = false;
  showDeleteModal: boolean = false;
  userToDeleteId: string | null = null;

  userSearchQuery: string = '';
  selectedStatusFilter: string = 'All';

  selectedUser: any = null;
  updatedStatusValue: string = '';

  usersList: any[] = [];
  filteredUsers: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.adminService.getAllUsers().subscribe(users => {
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
    });
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
      const payload = { status: this.updatedStatusValue };
      this.adminService.updateUserStatus(this.selectedUser.id.toString(), this.updatedStatusValue).subscribe(() => {
        this.loadAllUsers();
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
      this.adminService.deleteUser(this.userToDeleteId!.toString()).subscribe(() => {
        this.loadAllUsers();
      });
    }
    this.showDeleteModal = false;
    this.userToDeleteId = null;
  }
}