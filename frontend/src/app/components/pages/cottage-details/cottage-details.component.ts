import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cottage-details',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cottage-details.component.html',
  styleUrl: './cottage-details.component.css'
})
export class CottageDetailsComponent {
    cottage: any;
    auth: any;

    reserve() {

    }
    startDate: Date | undefined;
    endDate: Date | undefined;
    adults: number | undefined;
    children: number | undefined;
}
