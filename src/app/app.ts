import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  // imports: [RouterOutlet],
  standalone: false,
  templateUrl: './app.html',
  styleUrls: ['./app.css'] 
})
export class AppComponent {
   title = signal('text-to-voice-order');
}
