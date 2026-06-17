import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent {
  constructor(private router: Router, private apiService: ApiService, private adminService: AdminService) {}

  onLogout() {
    const email = localStorage.getItem('email');
    if (email) {
      // Find user by email and set status to Inactive
      this.adminService.getAllUsers().subscribe(users => {
        const user = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
        if (user && user.id) {
          this.adminService.updateUserStatus(user.id, 'Inactive').subscribe(() => {
            // clear auth and navigate after status update
            localStorage.removeItem('auth_token');
            localStorage.removeItem('email');
            this.router.navigate(['/login']);
          }, err => {
            // still logout even if status update fails
            console.error('Failed to set inactive status', err);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('email');
            this.router.navigate(['/login']);
          });
        } else {
          // No matching user, just logout
          localStorage.removeItem('auth_token');
          localStorage.removeItem('email');
          this.router.navigate(['/login']);
        }
      });
    } else {
      // No email stored, just logout
      localStorage.removeItem('auth_token');
      localStorage.removeItem('email');
      this.router.navigate(['/login']);
    }
  }

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
  onWishlist() { this.router.navigate(['/wishlist']); }
  onProfile() { this.router.navigate(['/profile']); }

  navigateToHome() { this.router.navigate(['/home']); }
}