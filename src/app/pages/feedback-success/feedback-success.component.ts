import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-feedback-success',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './feedback-success.component.html',
  styleUrls: ['./feedback-success.component.css']
})
export class FeedbackSuccessComponent {}
