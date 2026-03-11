import {
  Component, input, output, computed, signal, forwardRef,
  ViewChild, ElementRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
export type InputValidationState = 'default' | 'error' | 'warning' | 'success';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  host: {
    '[class]': 'hostClasses()'
  }
})
export class InputComponent implements ControlValueAccessor {
  private static nextId = 0;

  // Inputs
  type = input<InputType>('text');
  label = input<string>('');
  placeholder = input<string>('');
  helperText = input<string>('');
  error = input<string | null>(null);
  warning = input<string | null>(null);
  success = input<string | null>(null);
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  required = input<boolean>(false);
  maxLength = input<number | null>(null);
  showPasswordToggle = input<boolean>(false);
  autocomplete = input<string>('off');

  // Outputs
  focused = output<void>();
  blurred = output<void>();

  // ViewChild
  @ViewChild('inputElement', { static: false }) inputElement!: ElementRef<HTMLInputElement>;

  // Internal state
  value = signal<string>('');
  isFocused = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  cvaDisabled = signal<boolean>(false);

  readonly inputId = `ui-input-${InputComponent.nextId++}`;
  readonly helperTextId = `${this.inputId}-helper`;
  readonly validationMessageId = `${this.inputId}-validation`;

  // ControlValueAccessor
  private onChange: (value: string) => void = (_value) => undefined;
  private onTouched: () => void = () => undefined;

  // Computed
  validationState = computed<InputValidationState>(() => {
    if (this.error()) return 'error';
    if (this.warning()) return 'warning';
    if (this.success()) return 'success';
    return 'default';
  });

  validationMessage = computed(() => {
    return this.error() || this.warning() || this.success() || '';
  });

  hasLabel = computed(() => !!this.label());
  hasHelperText = computed(() => !!this.helperText());
  hasValidationMessage = computed(() => !!this.validationMessage());

  inputType = computed(() => {
    if (this.type() === 'password' && this.showPassword()) {
      return 'text';
    }
    return this.type();
  });

  isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  hostClasses = computed(() => {
    return [
      `input-state-${this.validationState()}`,
      this.isFocused() ? 'input-focused' : '',
      this.isDisabled() ? 'input-disabled' : ''
    ].filter(Boolean).join(' ');
  });

  ariaDescribedBy = computed(() => {
    const ids: string[] = [];
    if (this.hasHelperText()) ids.push(this.helperTextId);
    if (this.hasValidationMessage()) ids.push(this.validationMessageId);
    return ids.length > 0 ? ids.join(' ') : null;
  });

  // Methods
  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    this.value.set(newValue);
    this.onChange(newValue);
  }

  handleFocus(): void {
    this.isFocused.set(true);
    this.focused.emit();
  }

  handleBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
    this.blurred.emit();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  focusInput(): void {
    this.inputElement?.nativeElement.focus();
  }
}
