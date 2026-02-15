import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-card-header',
  standalone: true,
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-sm);
    }
  `]
})
export class CardHeaderComponent {}
