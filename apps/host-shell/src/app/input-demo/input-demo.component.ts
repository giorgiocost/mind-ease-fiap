import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { InputComponent, ButtonComponent } from '@shared/ui';

@Component({
  selector: 'app-input-demo',
  standalone: true,
  imports: [CommonModule, InputComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './input-demo.component.html',
  styleUrl: './input-demo.component.scss',
})
export class InputDemoComponent {
  private fb = inject(FormBuilder);

  form: FormGroup;
  submitted = false;

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$/)]],
    });
  }

  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.form.get('password') as FormControl;
  }

  get usernameControl(): FormControl {
    return this.form.get('username') as FormControl;
  }

  get phoneControl(): FormControl {
    return this.form.get('phone') as FormControl;
  }

  getEmailError(): string | null {
    if (this.emailControl.invalid && this.emailControl.touched) {
      if (this.emailControl.errors?.['required']) {
        return 'E-mail é obrigatório';
      }
      if (this.emailControl.errors?.['email']) {
        return 'E-mail inválido';
      }
    }
    return null;
  }

  getPasswordError(): string | null {
    if (this.passwordControl.invalid && this.passwordControl.touched) {
      if (this.passwordControl.errors?.['required']) {
        return 'Senha é obrigatória';
      }
      if (this.passwordControl.errors?.['minlength']) {
        return 'Senha deve ter no mínimo 8 caracteres';
      }
    }
    return null;
  }

  getUsernameError(): string | null {
    if (this.usernameControl.invalid && this.usernameControl.touched) {
      if (this.usernameControl.errors?.['required']) {
        return 'Nome de usuário é obrigatório';
      }
      if (this.usernameControl.errors?.['minlength']) {
        return 'Nome deve ter no mínimo 3 caracteres';
      }
    }
    return null;
  }

  getPhoneWarning(): string | null {
    if (this.phoneControl.value && this.phoneControl.invalid) {
      return 'Formato: (99) 99999-9999';
    }
    return null;
  }

  handleSubmit(): void {
    this.submitted = true;
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    if (this.form.valid) {
      console.log('Form submitted:', this.form.value);
      alert('Formulário enviado com sucesso!');
    }
  }

  resetForm(): void {
    this.form.reset();
    this.submitted = false;
  }
}
