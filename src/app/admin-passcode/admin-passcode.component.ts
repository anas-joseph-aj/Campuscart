import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-passcode',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-passcode.component.html',
  styleUrls: ['./admin-passcode.component.css']
})
export class AdminPasscodeComponent {
  passcode1 = ''; passcode2 = ''; passcode3 = ''; passcode4 = ''; passcode5 = ''; passcode6 = '';
  email = (() => {
    const emailStr = localStorage.getItem('email') || 'admin@campuscart.com';
    const lower = emailStr.toLowerCase().trim();
    if (lower === '24bcae05' || lower === '24bcae05@kristujayanti') {
      return '24bcae05@kristujayanti.com';
    }
    return emailStr;
  })();
  errorMessage = '';
  statusMessage = '';

  constructor(private router: Router, private adminService: AdminService) {}

  moveNext(event: any, nextInput: any) {
    if (event.target.value.length === 1 && nextInput) {
      nextInput.focus();
    }
  }

  login() {
    const passcode = this.passcode1 + this.passcode2 + this.passcode3 + this.passcode4 + this.passcode5 + this.passcode6;
    this.errorMessage = '';
    this.statusMessage = '';

    if (passcode.length < 6) {
      this.errorMessage = 'Please enter a 6-digit passcode.';
      return;
    }

    this.adminService.login(this.email, passcode).subscribe({
      next: (res: any) => {
        // Assume success response; store token if provided
        if (typeof res === 'string') {
          localStorage.setItem('adminToken', res);
        }
        this.handleSuccess();
      },
      error: (err) => {
        this.errorMessage = err.error || 'Invalid Passcode. Please try again.';
      }
    });
  }

  private handleSuccess() {
    this.statusMessage = 'Login Successful! Redirecting...';
    localStorage.setItem('isAdmin', 'true');
    setTimeout(() => {
      this.router.navigate(['/admin-dashboard']);
    }, 1500);
  }
}
