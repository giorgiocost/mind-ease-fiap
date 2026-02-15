import {
  Component, input, output, computed, effect,
  HostListener, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
export type ModalPosition = 'center' | 'side';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': '"dialog"',
    '[attr.aria-modal]': 'open()',
    '[attr.aria-labelledby]': '"modal-title"',
    '[attr.aria-describedby]': '"modal-body"'
  }
})
export class ModalComponent implements AfterViewInit {
  // Inputs
  open = input.required<boolean>();
  size = input<ModalSize>('md');
  position = input<ModalPosition>('center');
  title = input<string>('');
  closeOnBackdropClick = input<boolean>(true);
  closeOnEscape = input<boolean>(true);
  showCloseButton = input<boolean>(true);

  // Outputs
  openChange = output<boolean>();
  closed = output<void>();
  opened = output<void>();

  // ViewChild
  @ViewChild('modalContent', { static: false }) modalContent!: ElementRef<HTMLDivElement>;

  // Internal state
  private previousActiveElement: HTMLElement | null = null;

  // Computed
  hostClasses = computed(() => {
    return [
      `modal-size-${this.size()}`,
      `modal-position-${this.position()}`,
      this.open() ? 'modal-open' : ''
    ].filter(Boolean).join(' ');
  });

  hasTitle = computed(() => !!this.title());

  // Effect: Manage body scroll lock
  constructor() {
    effect(() => {
      if (this.open()) {
        this.lockBodyScroll();
        this.storePreviousFocus();
        this.opened.emit();
        setTimeout(() => this.trapFocus(), 100); // Wait for render
      } else {
        this.unlockBodyScroll();
        this.restorePreviousFocus();
        this.closed.emit();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.open()) {
      this.trapFocus();
    }
  }

  // Escape key handler
  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (this.open() && this.closeOnEscape()) {
      keyboardEvent.preventDefault();
      this.close();
    }
  }

  // Tab key handler for focus trap
  @HostListener('keydown.tab', ['$event'])
  handleTab(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!this.open()) return;

    const focusableElements = this.modalContent?.nativeElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (keyboardEvent.shiftKey && document.activeElement === firstElement) {
      // Shift+Tab on first element -> focus last
      keyboardEvent.preventDefault();
      lastElement.focus();
    } else if (!keyboardEvent.shiftKey && document.activeElement === lastElement) {
      // Tab on last element -> focus first
      keyboardEvent.preventDefault();
      firstElement.focus();
    }
  }

  // Methods
  close(): void {
    this.openChange.emit(false);
  }

  handleBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdropClick() && event.target === event.currentTarget) {
      this.close();
    }
  }

  private lockBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll(): void {
    document.body.style.overflow = '';
  }

  private storePreviousFocus(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
  }

  private restorePreviousFocus(): void {
    this.previousActiveElement?.focus();
    this.previousActiveElement = null;
  }

  private trapFocus(): void {
    // Move focus to first focusable element inside modal
    const focusableElements = this.modalContent?.nativeElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements && focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
}
