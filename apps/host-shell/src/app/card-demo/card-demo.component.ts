import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  CardFooterComponent,
  ButtonComponent
} from '@shared/ui';

@Component({
  selector: 'app-card-demo',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    CardFooterComponent,
    ButtonComponent
  ],
  templateUrl: './card-demo.component.html',
  styleUrl: './card-demo.component.scss',
})
export class CardDemoComponent {
  clickCount = 0;

  handleCardClick(): void {
    this.clickCount++;
    console.log('Card clicked!', this.clickCount);
  }
}
