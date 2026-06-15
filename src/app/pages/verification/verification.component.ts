import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})

export class VerificationComponent implements OnInit {

  email = localStorage.getItem('email') || '';

  constructor(private router: Router) {}

  ngOnInit(): void {

    setTimeout(() => {

      this.router.navigate(['/home']);

    }, 2000);

  }

}