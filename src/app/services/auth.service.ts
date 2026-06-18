import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  baseUrl = 'http://10.204.205.47:8080/auth';

  constructor(private http: HttpClient) { }

  sendOtp(email: string) {

    return this.http.post(
      `${this.baseUrl}/send-otp`,
      {
        email: email
      },
      {
        responseType: 'text'
      }
    );

  }

  verifyOtp(email: string, otp: string) {

    return this.http.post(
      `${this.baseUrl}/verify-otp`,
      {
        email: email,
        otp: otp
      },
      {
        responseType: 'text'
      }
    );

  }

  logout(): void {
    localStorage.clear();
  }

}