import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface AdminAccountData {
  name: string;
  email: string;
  passwordText: string;
}

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent implements OnInit {

  adminProfile: AdminAccountData = {
    name: 'Admin',
    email: 'admin@campusart.com',
    passwordText: '123456'
  };

  isPasswordVisible: boolean = false;
  isChangePasswordModalOpen: boolean = false;
  isSuccessNotificationOpen: boolean = false;
  notificationMessage: string = '';
  isProfileSavedMessageVisible: boolean = false;

  constructor() { }

  ngOnInit(): void { }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  blockNonNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  /**
   * Helper to fetch the character at a specific pin index location
   */
  getPinDigit(index: number): string {
    if (this.adminProfile.passwordText && this.adminProfile.passwordText[index]) {
      return this.adminProfile.passwordText[index];
    }
    return '';
  }

  /**
   * Manages character insertion, automatic box switching, and backspace removals
   */
  handlePinKeyDown(event: KeyboardEvent, index: number): void {
    const key = event.key;

    if (key === 'Backspace') {
      event.preventDefault();
      let currentPin = this.adminProfile.passwordText.split('');
      currentPin[index] = '';
      this.adminProfile.passwordText = currentPin.join('').trim();

      // Focus previous field if available
      if (index > 0) {
        const prevInput = document.getElementById(`pin-box-${index - 1}`) as HTMLInputElement;
        if (prevInput) prevInput.focus();
      }
      return;
    }

    // Capture standard numerical characters
    if (/^[0-9]$/.test(key)) {
      event.preventDefault();
      let currentPin = this.adminProfile.passwordText.split('');
      currentPin[index] = key;
      this.adminProfile.passwordText = currentPin.join('').slice(0, 6);

      // Focus next field if available
      if (index < 5) {
        const nextInput = document.getElementById(`pin-box-${index + 1}`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  }

  onChangePasswordClick(): void {
    this.notificationMessage = 'Password updated in local form state. Click Save Changes to finalize.';
    this.isSuccessNotificationOpen = true;

    setTimeout(() => {
      this.isSuccessNotificationOpen = false;
    }, 4000);
  }

  onSaveChanges(): void {
    console.log('Synchronizing updated admin profile payload blocks:', this.adminProfile);
    this.isProfileSavedMessageVisible = true;

    setTimeout(() => {
      this.isProfileSavedMessageVisible = false;
    }, 4000);
  }
}