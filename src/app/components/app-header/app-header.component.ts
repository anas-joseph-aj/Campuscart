import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent {
  constructor(private router: Router, private apiService: ApiService) {}

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
  onLogout() { 
    localStorage.removeItem('auth_token'); 
    localStorage.removeItem('email'); 
    this.router.navigate(['/login']); 
  }
  navigateToHome() { this.router.navigate(['/home']); }
}