import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'flat' | 'outlined' | 'elevated' | 'raised';
export type CardDensity = 'simple' | 'medium' | 'full';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    'role': 'article'
  }
})
export class CardComponent {
  variant = input<CardVariant>('elevated');
  density = input<CardDensity>('medium');
  clickable = input<boolean>(false);

  hostClasses = computed(() => {
    return [
      `card-${this.variant()}`,
      `card-density-${this.density()}`,
      this.clickable() ? 'card-clickable' : ''
    ].filter(Boolean).join(' ');
  });
}
