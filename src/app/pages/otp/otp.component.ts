import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class OtpComponent implements OnInit {
  otp1 = ''; otp2 = ''; otp3 = ''; otp4 = ''; otp5 = ''; otp6 = '';
  email = localStorage.getItem('email') || '';
  timer = 120;
  interval: any;

  statusMessage: string = ''; // Added for feedback
  errorMessage: string = '';  // Added for error feedback

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private wishlistService: WishlistService
  ) { }

  ngOnInit(): void { this.startTimer(); }

  startTimer() {
    this.interval = setInterval(() => {
      if (this.timer > 0) this.timer--;
      else clearInterval(this.interval);
    }, 1000);
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  padZero(num: number): string { return num < 10 ? '0' + num : num.toString(); }

  moveNext(event: any, nextInput: any) {
    if (event.target.value.length === 1 && nextInput) nextInput.focus();
  }

  verifyOtp() {
    const otp = this.otp1 + this.otp2 + this.otp3 + this.otp4 + this.otp5 + this.otp6;
    this.errorMessage = '';
    this.statusMessage = '';

    this.authService.verifyOtp(this.email, otp).subscribe({
      next: (res: any) => {
        this.handleSuccess();
      },
      error: (err) => {
        if (err.status === 200 || err.status === 201) {
          this.handleSuccess();
        } else {
          this.errorMessage = 'Invalid OTP. Please try again.';
        }
      }
    });
  }

  resendOtp() {
    if (!this.email) {
      this.errorMessage = 'Unable to resend OTP. Please login again.';
      return;
    }

    this.errorMessage = '';
    this.statusMessage = 'Resending OTP...';
    this.clearTimer();
    this.timer = 120;

    this.authService.sendOtp(this.email).subscribe({
      next: () => {
        this.statusMessage = 'OTP resent successfully to ' + this.email + '.';
        this.resetOtpInputs();
        this.startTimer();
      },
      error: (err) => {
        console.error('Resend OTP failed', err);
        this.statusMessage = '';
        this.errorMessage = 'Failed to resend OTP. Please try again.';
        this.startTimer();
      }
    });
  }

  private resetOtpInputs() {
    this.otp1 = '';
    this.otp2 = '';
    this.otp3 = '';
    this.otp4 = '';
    this.otp5 = '';
    this.otp6 = '';
  }

  private clearTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private handleSuccess() {
    this.statusMessage = 'Login Successful! Redirecting...';
    if (this.email) {
      this.apiService.getSellerProfile(this.email).subscribe({
        next: (profile) => {
          if (profile) {
            localStorage.setItem('profile', JSON.stringify(profile));
          }
        },
        error: (err) => console.error('Failed to pre-fetch profile on login', err)
      });
      this.wishlistService.loadWishlistFromBackend();
        // Store email for later use
        localStorage.setItem('email', this.email);
        setTimeout(() => this.router.navigate(['/home']), 1500);
    }
  }
}