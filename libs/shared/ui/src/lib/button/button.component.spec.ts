import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Variants', () => {
    it('should apply primary variant class by default', () => {
      expect(component.hostClasses()).toContain('button-primary');
    });

    it('should apply secondary variant class', () => {
      fixture.componentRef.setInput('variant', 'secondary');
      fixture.detectChanges();
      expect(component.hostClasses()).toContain('button-secondary');
    });

    it('should apply danger variant class', () => {
      fixture.componentRef.setInput('variant', 'danger');
      fixture.detectChanges();
      expect(component.hostClasses()).toContain('button-danger');
    });

    it('should apply ghost variant class', () => {
      fixture.componentRef.setInput('variant', 'ghost');
      fixture.detectChanges();
      expect(component.hostClasses()).toContain('button-ghost');
    });
  });

  describe('Sizes', () => {
    it('should apply md size class by default', () => {
      expect(component.hostClasses()).toContain('button-md');
    });

    it('should apply sm size class', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(component.hostClasses()).toContain('button-sm');
    });

    it('should apply lg size class', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(component.hostClasses()).toContain('button-lg');
    });
  });

  describe('Loading state', () => {
    it('should show loading spinner when loading=true', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.button-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should not show spinner when loading=false', () => {
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.button-spinner');
      expect(spinner).toBeNull();
    });

    it('should set aria-busy=true when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('aria-busy')).toBe('true');
    });

    it('should be disabled when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expect(component.isDisabled()).toBe(true);
    });

    it('should apply button-loading class', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expect(component.hostClasses()).toContain('button-loading');
    });
  });

  describe('Disabled state', () => {
    it('should set disabled attribute', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.hasAttribute('disabled')).toBe(true);
    });

    it('should apply button-disabled class', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(component.hostClasses()).toContain('button-disabled');
    });

    it('should not emit clicked event when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      let emitted = false;
      component.clicked.subscribe(() => {
        emitted = true;
      });

      const event = new MouseEvent('click');
      component.handleClick(event);

      expect(emitted).toBe(false);
    });

    it('should set tabindex=-1 when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('Click handling', () => {
    it('should emit clicked event on click', () => {
      let emitted = false;
      component.clicked.subscribe(() => {
        emitted = true;
      });

      const event = new MouseEvent('click');
      component.handleClick(event);

      expect(emitted).toBe(true);
    });

    it('should emit clicked event on Enter key', () => {
      let emitted = false;
      component.clicked.subscribe(() => {
        emitted = true;
      });

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.handleClick(event);

      expect(emitted).toBe(true);
    });

    it('should emit clicked event on Space key', () => {
      let emitted = false;
      component.clicked.subscribe(() => {
        emitted = true;
      });

      const event = new KeyboardEvent('keydown', { key: ' ' });
      component.handleClick(event);

      expect(emitted).toBe(true);
    });
  });

  describe('Debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should not debounce by default', () => {
      let clickCount = 0;
      component.clicked.subscribe(() => clickCount++);

      component.handleClick(new MouseEvent('click'));
      component.handleClick(new MouseEvent('click'));

      expect(clickCount).toBe(2);
    });

    it('should debounce when debounce > 0', () => {
      fixture.componentRef.setInput('debounce', 1000);
      fixture.detectChanges();

      let clickCount = 0;
      component.clicked.subscribe(() => clickCount++);

      component.handleClick(new MouseEvent('click'));
      jest.advanceTimersByTime(500);
      component.handleClick(new MouseEvent('click')); // Should be ignored

      expect(clickCount).toBe(1);
    });

    it('should allow click after debounce time passes', () => {
      fixture.componentRef.setInput('debounce', 1000);
      fixture.detectChanges();

      let clickCount = 0;
      component.clicked.subscribe(() => clickCount++);

      component.handleClick(new MouseEvent('click'));
      jest.advanceTimersByTime(1100);
      component.handleClick(new MouseEvent('click')); // Should work

      expect(clickCount).toBe(2);
    });
  });

  describe('Icon', () => {
    it('should show icon when icon input is set', () => {
      fixture.componentRef.setInput('icon', 'edit');
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.button-icon');
      expect(icon).toBeTruthy();
    });

    it('should not show icon by default', () => {
      const icon = fixture.nativeElement.querySelector('.button-icon');
      expect(icon).toBeNull();
    });

    it('should apply icon class', () => {
      fixture.componentRef.setInput('icon', 'edit');
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.button-icon');
      expect(icon.classList.contains('icon-edit')).toBe(true);
    });

    it('should show icon on left by default', () => {
      fixture.componentRef.setInput('icon', 'edit');
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.button-icon-left');
      expect(icon).toBeTruthy();
    });

    it('should show icon on right when iconPosition=right', () => {
      fixture.componentRef.setInput('icon', 'edit');
      fixture.componentRef.setInput('iconPosition', 'right');
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.button-icon-right');
      expect(icon).toBeTruthy();
    });
  });

  describe('ARIA attributes', () => {
    it('should have role=button', () => {
      expect(fixture.nativeElement.getAttribute('role')).toBe('button');
    });

    it('should have tabindex=0 by default', () => {
      expect(fixture.nativeElement.getAttribute('tabindex')).toBe('0');
    });

    it('should set aria-busy=true when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('aria-busy')).toBe('true');
    });

    it('should set aria-busy=false when not loading', () => {
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('aria-busy')).toBe('false');
    });
  });

  describe('Content projection', () => {
    it('should display button label', () => {
      const label = fixture.nativeElement.querySelector('.button-label');
      expect(label).toBeTruthy();
    });
  });
});
