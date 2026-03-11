import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, HostListener, input } from '@angular/core';

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
    '[attr.role]': 'clickable() ? "button" : "article"',
    '[attr.tabindex]': 'clickable() ? 0 : null'
  }
})
export class CardComponent {
  variant = input<CardVariant>('elevated');
  density = input<CardDensity>('medium');
  clickable = input<boolean>(false);

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  handleKeydown(event: Event): void {
    if (this.clickable()) {
      event.preventDefault();
      (event.target as HTMLElement).click();
    }
  }

  hostClasses = computed(() => {
    return [
      `card-${this.variant()}`,
      `card-density-${this.density()}`,
      this.clickable() ? 'card-clickable' : '',
      this.clickable() ? 'clickable' : ''
    ].filter(Boolean).join(' ');
  });
}
