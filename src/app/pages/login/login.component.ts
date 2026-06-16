import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  errorMessage: string = '';
  statusMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  generateOtp() {
    this.errorMessage = '';
    let enteredEmail = this.email?.trim();
    // If only the domain is entered, prepend a placeholder user
    if (enteredEmail === '@kristujayanti.com') {
      enteredEmail = 'user@kristujayanti.com';
    }
    // Normalize for case‑insensitive comparison
    const normalizedEmail = enteredEmail ? enteredEmail.toLowerCase() : '';
    // Store email for later steps
    localStorage.setItem('email', normalizedEmail || 'admin@campuscart.com');
    if (normalizedEmail && normalizedEmail.endsWith('@kristujayanti.com')) {
      if (normalizedEmail === '24bcae05@kristujayanti.com') {
        // Direct admin passcode flow for this specific address
        this.statusMessage = "Redirecting to Admin Passcode...";
        setTimeout(() => {
          this.router.navigate(['/admin-passcode']);
        }, 1000);
      } else {
        // Send OTP for other kristujayanti.com emails
        this.statusMessage = "Sending OTP...";
        this.authService.sendOtp(normalizedEmail).subscribe({
          next: (res) => {
            console.log('OTP send response:', res);
            this.statusMessage = "OTP sent successfully! Check your email.";
            setTimeout(() => {
              this.router.navigate(['/otp']);
            }, 1000);
          },
          error: (err) => {
            console.error('Failed to send OTP', err);
            this.errorMessage = 'Failed to send OTP. Please try again.';
            // Navigate to OTP page to allow manual entry
            this.statusMessage = "Proceed to OTP entry (email may not have been sent).";
            setTimeout(() => {
              this.router.navigate(['/otp']);
            }, 1000);
          }
        });
      }
    } else {
      // Default behavior for other emails (admin passcode)
      this.statusMessage = "Redirecting to Admin Passcode...";
      setTimeout(() => {
        this.router.navigate(['/admin-passcode']);
      }, 1000);
    }
  }
}