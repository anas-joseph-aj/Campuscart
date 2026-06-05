import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // For page navigation injection point

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // RouterOutlet must be included here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CampusCart';
}