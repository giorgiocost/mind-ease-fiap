// apps/mfe-dashboard/src/app/components/stats-card/stats-card.component.ts
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '@shared/ui';

export type StatsVariant = 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {
  // Inputs
  icon = input.required<string>();
  label = input.required<string>();
  value = input.required<number | string>();
  variant = input<StatsVariant>('info');
  loading = input(false);
  clickable = input(true);
  trend = input<'up' | 'down' | null>(null); // Optional trend indicator
  trendValue = input<string | null>(null); // e.g., "+5%"

  // Outputs
  clicked = output<void>();

  // Computed
  cardVariant = computed(() => {
    const variant = this.variant();
    switch (variant) {
      case 'info':
        return 'outlined';
      case 'success':
      case 'warning':
      case 'danger':
        return 'elevated';
      default:
        return 'elevated';
    }
  });

  // Actions
  handleClick() {
    if (this.clickable() && !this.loading()) {
      this.clicked.emit();
    }
  }
}
