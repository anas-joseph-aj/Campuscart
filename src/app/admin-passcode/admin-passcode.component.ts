import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-passcode',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-passcode.component.html',
  styleUrls: ['./admin-passcode.component.css']
})
export class AdminPasscodeComponent {
  passcode1 = ''; passcode2 = ''; passcode3 = ''; passcode4 = ''; passcode5 = ''; passcode6 = '';
  email = 'admin@campuscart.com';
  errorMessage = '';
  statusMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

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

    this.authService.verifyOtp(this.email, passcode).subscribe({
      next: (res: any) => {
        this.handleSuccess();
      },
      error: (err) => {
        if (err.status === 200 || err.status === 201) {
          this.handleSuccess();
        } else {
          // Bypass check for development and testing
          if (passcode === '123456') {
            this.handleSuccess();
          } else {
            this.errorMessage = 'Invalid Passcode. Please try again.';
          }
        }
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
