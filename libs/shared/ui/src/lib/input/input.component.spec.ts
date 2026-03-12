import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ControlValueAccessor', () => {
    it('should implement writeValue', () => {
      component.writeValue('test@email.com');
      expect(component.value()).toBe('test@email.com');
    });

    it('should call onChange when input changes', () => {
      const onChangeSpy = jest.fn();
      component.registerOnChange(onChangeSpy);
      
      const event = { target: { value: 'new value' } } as any;
      component.handleInput(event);
      
      expect(onChangeSpy).toHaveBeenCalledWith('new value');
      expect(component.value()).toBe('new value');
    });

    it('should call onTouched when input blurs', () => {
      const onTouchedSpy = jest.fn();
      component.registerOnTouched(onTouchedSpy);
      
      component.handleBlur();
      
      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('Validation states', () => {
    it('should show error state', () => {
      fixture.componentRef.setInput('error', 'Campo obrigatório');
      fixture.detectChanges();
      expect(component.validationState()).toBe('error');
    });

    it('should show warning state', () => {
      fixture.componentRef.setInput('warning', 'Senha fraca');
      fixture.detectChanges();
      expect(component.validationState()).toBe('warning');
    });

    it('should show success state', () => {
      fixture.componentRef.setInput('success', 'E-mail disponível');
      fixture.detectChanges();
      expect(component.validationState()).toBe('success');
    });

    it('should prioritize error over warning', () => {
      fixture.componentRef.setInput('error', 'Erro');
      fixture.componentRef.setInput('warning', 'Aviso');
      fixture.detectChanges();
      expect(component.validationState()).toBe('error');
    });

    it('should set aria-invalid when error', () => {
      fixture.componentRef.setInput('error', 'Erro');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('.input-field');
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('Password toggle', () => {
    it('should show toggle button when showPasswordToggle=true', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.componentRef.setInput('showPasswordToggle', true);
      fixture.detectChanges();
      
      const toggle = fixture.nativeElement.querySelector('.input-toggle-password');
      expect(toggle).toBeTruthy();
    });

    it('should toggle password visibility', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.componentRef.setInput('showPasswordToggle', true);
      fixture.detectChanges();
      
      expect(component.inputType()).toBe('password');
      
      component.togglePasswordVisibility();
      fixture.detectChanges();
      
      expect(component.inputType()).toBe('text');
    });
  });

  describe('Label', () => {
    it('should show label when provided', () => {
      fixture.componentRef.setInput('label', 'E-mail');
      fixture.detectChanges();
      
      const label = fixture.nativeElement.querySelector('.input-label');
      expect(label.textContent).toContain('E-mail');
    });

    it('should show asterisk when required', () => {
      fixture.componentRef.setInput('label', 'E-mail');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      
      const asterisk = fixture.nativeElement.querySelector('.input-label-asterisk');
      expect(asterisk).toBeTruthy();
    });
  });

  describe('Helper text', () => {
    it('should show helper text when provided', () => {
      fixture.componentRef.setInput('helperText', 'Digite seu e-mail');
      fixture.detectChanges();
      
      const helper = fixture.nativeElement.querySelector('.input-helper-text');
      expect(helper.textContent).toContain('Digite seu e-mail');
    });

    it('should hide helper text when validation message shown', () => {
      fixture.componentRef.setInput('helperText', 'Helper');
      fixture.componentRef.setInput('error', 'Erro');
      fixture.detectChanges();
      
      const helper = fixture.nativeElement.querySelector('.input-helper-text');
      expect(helper).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-describedby when helper text present', () => {
      fixture.componentRef.setInput('helperText', 'Helper');
      fixture.detectChanges();
      
      expect(component.ariaDescribedBy()).toContain('input-helper');
    });

    it('should have aria-describedby when validation message present', () => {
      fixture.componentRef.setInput('error', 'Erro');
      fixture.detectChanges();
      
      expect(component.ariaDescribedBy()).toContain('input-validation');
    });

    it('should have role="alert" on validation message', () => {
      fixture.componentRef.setInput('error', 'Erro');
      fixture.detectChanges();
      
      const validation = fixture.nativeElement.querySelector('.input-validation-message');
      expect(validation.getAttribute('role')).toBe('alert');
    });
  });

  describe('Focus handling', () => {
    it('should emit focused event on focus', () => {
      const focusedSpy = jest.fn();
      component.focused.subscribe(focusedSpy);
      
      component.handleFocus();
      
      expect(focusedSpy).toHaveBeenCalled();
      expect(component.isFocused()).toBe(true);
    });

    it('should emit blurred event on blur', () => {
      const blurredSpy = jest.fn();
      component.blurred.subscribe(blurredSpy);
      
      component.handleBlur();
      
      expect(blurredSpy).toHaveBeenCalled();
      expect(component.isFocused()).toBe(false);
    });
  });

  describe('Computed properties', () => {
    it('should compute hasLabel correctly', () => {
      expect(component.hasLabel()).toBe(false);
      
      fixture.componentRef.setInput('label', 'Test Label');
      fixture.detectChanges();
      
      expect(component.hasLabel()).toBe(true);
    });

    it('should compute hasHelperText correctly', () => {
      expect(component.hasHelperText()).toBe(false);
      
      fixture.componentRef.setInput('helperText', 'Test Helper');
      fixture.detectChanges();
      
      expect(component.hasHelperText()).toBe(true);
    });

    it('should compute hasValidationMessage correctly', () => {
      expect(component.hasValidationMessage()).toBe(false);
      
      fixture.componentRef.setInput('error', 'Test Error');
      fixture.detectChanges();
      
      expect(component.hasValidationMessage()).toBe(true);
    });
  });
});
