import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  isEditMode: boolean = true; 

  // Fields initialized blank as requested
  userName: string = '';
  userDept: string = '';
  userRoll: string = '';
  
  // Storage properties for the dynamic profile parameters
  userEmail: string = ''; 
  userJoinedDate: string = '';
  
  profileImageUrl: string | null = null;
  
  message: string = '';
  isError: boolean = false;

  ngOnInit() {
    this.generateRegistrationDetails(this.userName, this.userRoll);
  }

  // Generates email based on Roll No/ID input parameter
  generateRegistrationDetails(name: string, rollNo: string) {
    const cleanRoll = rollNo.trim().toUpperCase();
    
    if (cleanRoll) {
      this.userEmail = `${cleanRoll}@kristujayanti.com`;
    } else {
      this.userEmail = 'student@kristujayanti.com';
    }

    this.userJoinedDate = 'Aug 2026';
  }

  triggerGallery(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Updated method signature to accept and save roll details smoothly
  saveProfile(name: string, department: string, rollNo: string) {
    if (!name.trim() || !department.trim() || !rollNo.trim()) {
      this.message = 'Please enter all fields!';
      this.isError = true;
      return;
    }

    this.isError = false;
    this.userName = name.trim();
    this.userDept = department.trim();
    this.userRoll = rollNo.trim();
    
    // Pass the saved data values straight into the calculation module
    this.generateRegistrationDetails(this.userName, this.userRoll);

    this.message = 'Profile Saved Successfully !';
    
    setTimeout(() => {
      this.message = '';
      this.isEditMode = false;
    }, 800);
  }
}