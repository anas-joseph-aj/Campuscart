import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface User {
  id: number;
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
  userToDeleteId: number | null = null;

  userSearchQuery: string = '';
  selectedStatusFilter: string = 'All';

  selectedUser: User | null = null;
  updatedStatusValue: string = ''; 

  usersList: User[] = [
    { id: 1, name: 'Ananya Verma', email: 'ananya.v@kristujayanti.com', joinedOn: '12 Apr 2026', status: 'Active' },
    { id: 2, name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', joinedOn: '28 Jan 2026', status: 'Inactive' },
    { id: 3, name: 'Sneha Nair', email: 'sneha.nair@hotmail.com', joinedOn: '20 July 2026', status: 'Active' },
    { id: 4, name: 'Vikram Malhotra', email: 'v.malhotra@outlook.com', joinedOn: '05 Mar 2026', status: 'Active' }
  ];

  filteredUsers: User[] = [];

  ngOnInit(): void {
    this.filterUsers();
  }

  filterUsers(): void {
    const query = this.userSearchQuery.trim().toLowerCase();
    
    const result = this.usersList.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(query) || 
                            user.email.toLowerCase().includes(query);
      
      const matchesStatus = this.selectedStatusFilter === 'All' || 
                            user.status === this.selectedStatusFilter;

      return matchesSearch && matchesStatus;
    });

    // Forced order: Inactive accounts stay explicitly fixed up top
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

  openEditModal(user: User): void {
    this.selectedUser = user; 
    this.updatedStatusValue = user.status; 
    this.showUserEditModal = true;
  }

  onStatusRadioChange(status: string): void {
    this.updatedStatusValue = status;
  }

  saveUserStatus(): void {
    if (this.selectedUser) {
      const userIndex = this.usersList.findIndex(u => u.id === this.selectedUser!.id);
      if (userIndex !== -1) {
        this.usersList[userIndex].status = this.updatedStatusValue;
        this.filterUsers(); 
      }
    }
    this.showUserEditModal = false;
  }

  openDeleteConfirmation(userId: number): void {
    this.userToDeleteId = userId;
    this.showDeleteModal = true;
  }

  confirmDeleteUser(): void {
    if (this.userToDeleteId !== null) {
      this.usersList = this.usersList.filter(user => user.id !== this.userToDeleteId);
      this.filterUsers();
    }
    this.showDeleteModal = false;
    this.userToDeleteId = null;
  }
}