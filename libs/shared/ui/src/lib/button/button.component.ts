import {
  Component,
  input,
  output,
  computed,
  signal,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type IconPosition = 'left' | 'right';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.disabled]': 'isDisabled() ? true : null',
    '[attr.aria-busy]': 'loading()',
    '[attr.role]': '"button"',
    '[attr.tabindex]': 'isDisabled() ? -1 : 0',
  },
})
export class ButtonComponent {
  // Inputs (Signal-based)
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  icon = input<string | null>(null);
  iconPosition = input<IconPosition>('left');
  debounce = input<number>(0); // Debounce in ms (0 = no debounce)

  // Outputs
  clicked = output<Event>();

  // Internal state
  private lastClickTime = signal<number>(0);

  // Computed
  isDisabled = computed(() => this.disabled() || this.loading());

  hostClasses = computed(() => {
    return [
      `button-${this.variant()}`,
      `button-${this.size()}`,
      this.loading() ? 'button-loading' : '',
      this.isDisabled() ? 'button-disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });

  hasIcon = computed(() => !!this.icon());
  iconClass = computed(() => (this.icon() ? `icon-${this.icon()}` : ''));

  // Click handler with debounce
  @HostListener('click', ['$event'])
  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  handleClick(event: Event): void {
    if (this.isDisabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const now = Date.now();
    const debounceTime = this.debounce();

    if (debounceTime > 0) {
      const timeSinceLastClick = now - this.lastClickTime();
      if (timeSinceLastClick < debounceTime) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }

    this.lastClickTime.set(now);
    this.clicked.emit(event);
  }
}
