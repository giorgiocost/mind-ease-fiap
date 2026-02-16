import { Directive, ElementRef, EventEmitter, Output, HostListener, inject } from '@angular/core';

/**
 * 🎯 ClickOutsideDirective
 *
 * Emits an event when a click occurs outside the host element.
 * Useful for closing dropdowns, modals, and other overlay components.
 *
 * Usage:
 * ```html
 * <div (clickOutside)="closeDropdown()">
 *   <button>Dropdown</button>
 * </div>
 * ```
 */
@Directive({
  selector: '[clickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  private elementRef = inject(ElementRef);

  @Output() clickOutside = new EventEmitter<void>();

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
