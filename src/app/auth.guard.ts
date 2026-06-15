import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const router = inject(Router);
  const email = localStorage.getItem('email');

  if (email) {
    return true; 
  } else {
    router.navigate(['/']); // Redirect to Login
    return false;
  }
};