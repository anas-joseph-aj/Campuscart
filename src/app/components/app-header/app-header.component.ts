import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent {
  isMobileMenuOpen = false;
  constructor(private router: Router, private apiService: ApiService, private authService: AuthService) { }

  onChat() { this.router.navigate(['/chat']); }
  onSell() {
    const email = localStorage.getItem('email');
    if (email) {
      this.apiService.getSellerProfile(email).subscribe(profile => {
        if (!profile || !profile.name) {
          this.router.navigate(['/profile']);
        } else {
          this.router.navigate(['/sell']);
        }
      }, err => {
        this.router.navigate(['/profile']);
      });
    } else {
      this.router.navigate(['/sell']);
    }
  }
  onMessages() { this.router.navigate(['/messages']); }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onLogout() {
    // Clear auth data and navigate to login or home
    localStorage.clear();
    // Optionally inform auth service
    if (this.authService && this.authService.logout) {
      this.authService.logout();
    }
    this.router.navigate(['/login']);
  }
  onWishlist() { this.router.navigate(['/wishlist']); }
  onProfile() { this.router.navigate(['/profile']); }

  navigateToHome() { this.router.navigate(['/home']); }
}