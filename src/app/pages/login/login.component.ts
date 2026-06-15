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
  statusMessage: string = ''; // 1. Added for success message

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  generateOtp() {
    const allowedDomain = "@kristujayanti.com";

    if (!this.email || !this.email.endsWith(allowedDomain)) {
      this.errorMessage = "Access Denied: Only @kristujayanti.com emails are allowed.";
      return;
    }

    this.errorMessage = '';
    localStorage.setItem('email', this.email);

    this.authService.sendOtp(this.email)
      .subscribe({
        next: (res: any) => {
          // 2. Set the success message instead of using alert()
          this.statusMessage = "OTP Sent Successfully! Redirecting...";
          
          // 3. Use setTimeout to wait 1.5 seconds before moving to the next page
          setTimeout(() => {
            this.router.navigate(['/otp']);
          }, 1500);
        },
        error: (err) => {
          console.log(err);
          this.errorMessage = "Failed to send OTP. Please ensure the backend is running and reachable.";
        }
      });
  }
}