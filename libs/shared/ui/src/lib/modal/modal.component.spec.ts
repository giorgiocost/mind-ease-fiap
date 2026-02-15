import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Open/Close', () => {
    it('should not show modal when open=false', () => {
      const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
      expect(backdrop).toBeNull();
    });

    it('should show modal when open=true', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      
      const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
      expect(backdrop).toBeTruthy();
    });

    it('should close on close button click', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      
      const spy = jest.fn();
      component.openChange.subscribe(spy);
      
      const closeButton = fixture.nativeElement.querySelector('.modal-close-button');
      closeButton.click();
      
      expect(spy).toHaveBeenCalledWith(false);
    });

    it('should close on escape key', () => {
      fixture.componentRef.setInput('open', true);
      fixture.componentRef.setInput('closeOnEscape', true);
      fixture.detectChanges();
      
      const spy = jest.fn();
      component.openChange.subscribe(spy);
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.handleEscape(event);
      
      expect(spy).toHaveBeenCalledWith(false);
    });

    it('should not close on escape when closeOnEscape=false', () => {
      fixture.componentRef.setInput('open', true);
      fixture.componentRef.setInput('closeOnEscape', false);
      fixture.detectChanges();
      
      const spy = jest.fn();
      component.openChange.subscribe(spy);
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.handleEscape(event);
      
      expect(spy).not.toHaveBeenCalled();
    });

    it('should close on backdrop click', () => {
      fixture.componentRef.setInput('open', true);
      fixture.componentRef.setInput('closeOnBackdropClick', true);
      fixture.detectChanges();
      
      const spy = jest.fn();
      component.openChange.subscribe(spy);
      
      const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
      const event = { target: backdrop, currentTarget: backdrop } as any;
      component.handleBackdropClick(event);
      
      expect(spy).toHaveBeenCalledWith(false);
    });

    it('should not close on backdrop click when closeOnBackdropClick=false', () => {
      fixture.componentRef.setInput('open', true);
      fixture.componentRef.setInput('closeOnBackdropClick', false);
      fixture.detectChanges();
      
      const spy = jest.fn();
      component.openChange.subscribe(spy);
      
      const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
      const event = { target: backdrop, currentTarget: backdrop } as any;
      component.handleBackdropClick(event);
      
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Sizes', () => {
    it('should apply md size by default', () => {
      expect(component.hostClasses()).toContain('modal-size-md');
    });

    it('should apply sm size', () => {
      fixture.componentRef.setInput('size', 'sm');
      expect(component.hostClasses()).toContain('modal-size-sm');
    });

    it('should apply lg size', () => {
      fixture.componentRef.setInput('size', 'lg');
      expect(component.hostClasses()).toContain('modal-size-lg');
    });

    it('should apply xl size', () => {
      fixture.componentRef.setInput('size', 'xl');
      expect(component.hostClasses()).toContain('modal-size-xl');
    });

    it('should apply fullscreen size', () => {
      fixture.componentRef.setInput('size', 'fullscreen');
      expect(component.hostClasses()).toContain('modal-size-fullscreen');
    });
  });

  describe('Position', () => {
    it('should apply center position by default', () => {
      expect(component.hostClasses()).toContain('modal-position-center');
    });

    it('should apply side position', () => {
      fixture.componentRef.setInput('position', 'side');
      expect(component.hostClasses()).toContain('modal-position-side');
    });
  });

  describe('Title', () => {
    it('should show title when provided', () => {
      fixture.componentRef.setInput('open', true);
      fixture.componentRef.setInput('title', 'Test Modal');
      fixture.detectChanges();
      
      const title = fixture.nativeElement.querySelector('.modal-title');
      expect(title.textContent).toContain('Test Modal');
    });

    it('should not show title when empty', () => {
      fixture.componentRef.setInput('open', true);
      fixture.componentRef.setInput('title', '');
      fixture.detectChanges();
      
      const title = fixture.nativeElement.querySelector('.modal-title');
      expect(title).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have role="dialog"', () => {
      expect(fixture.nativeElement.getAttribute('role')).toBe('dialog');
    });

    it('should have aria-modal when open', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('aria-modal')).toBe('true');
    });

    it('should have aria-labelledby', () => {
      expect(fixture.nativeElement.getAttribute('aria-labelledby')).toBe('modal-title');
    });

    it('should have aria-describedby', () => {
      expect(fixture.nativeElement.getAttribute('aria-describedby')).toBe('modal-body');
    });
  });

  describe('Event outputs', () => {
    it('should emit opened event when modal opens', (done) => {
      component.opened.subscribe(() => {
        done();
      });
      
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
    });

    it('should emit closed event when modal closes', (done) => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      
      component.closed.subscribe(() => {
        done();
      });
      
      fixture.componentRef.setInput('open', false);
      fixture.detectChanges();
    });
  });
});
