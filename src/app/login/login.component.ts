import { Component } from '@angular/core';
import { Router } from '@angular/router'; // <-- IMPORT THE ROUTER

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  // Inject the router inside your constructor execution layer
  constructor(private router: Router) {}

  onLogin() {
    // 1. Put your standard credential validation logic here...
    
    // 2. Once validation succeeds, trigger this route call to load the product page!
    this.router.navigate(['/products', 1]); 
  }
}