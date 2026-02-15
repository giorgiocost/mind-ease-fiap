import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@shared/ui';

@Component({
  selector: 'app-button-demo',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './button-demo.component.html',
  styleUrl: './button-demo.component.scss',
})
export class ButtonDemoComponent {
  clickCount = 0;

  handleClick(event: Event): void {
    this.clickCount++;
    console.log('Button clicked!', this.clickCount, event);
  }
}
