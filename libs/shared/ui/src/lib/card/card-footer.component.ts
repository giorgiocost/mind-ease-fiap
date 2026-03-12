import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-card-footer',
  standalone: true,
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--spacing-sm);
    }
  `]
})
export class CardFooterComponent {}
