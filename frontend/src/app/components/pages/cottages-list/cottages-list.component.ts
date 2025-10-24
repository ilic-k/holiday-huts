import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cottages-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './cottages-list.component.html',
  styleUrl: './cottages-list.component.css'
})
export class CottagesListComponent {
  q: string = '';
  place: string = '';

  cottages: any[] = [];

  load(){
    
  }
}
