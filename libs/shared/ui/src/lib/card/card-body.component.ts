import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-card-body',
  standalone: true,
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      flex: 1;
    }
  `]
})
export class CardBodyComponent {}
