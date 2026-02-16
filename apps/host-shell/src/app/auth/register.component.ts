import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '@shared/state';
import { ButtonComponent } from '@shared/ui';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonComponent],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Registrar</h1>
        <form (ngSubmit)="handleRegister()">
          <div class="form-group">
            <label for="name">Nome</label>
            <input
              type="text"
              id="name"
              [(ngModel)]="name"
              name="name"
              required
              autocomplete="name"
            >
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              required
              autocomplete="email"
            >
          </div>
          <div class="form-group">
            <label for="password">Senha</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              required
              autocomplete="new-password"
            >
          </div>

          @if (error()) {
            <div class="error">{{ error() }}</div>
          }

          <ui-button type="submit" variant="primary" [loading]="loading()">
            Registrar
          </ui-button>
        </form>

        <p class="login-link">
          Já tem conta?
          <a routerLink="/login">Faça login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: var(--color-background);
      padding: var(--spacing-md);
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: var(--spacing-xl);
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);

      h1 {
        margin: 0 0 var(--spacing-lg);
        color: var(--color-text-primary);
        text-align: center;
      }
    }

    .form-group {
      margin-bottom: var(--spacing-md);

      label {
        display: block;
        margin-bottom: var(--spacing-xs);
        color: var(--color-text-primary);
        font-weight: 500;
      }

      input {
        width: 100%;
        padding: var(--spacing-sm);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background-color: var(--color-background);
        color: var(--color-text-primary);
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: var(--color-primary);
        }
      }
    }

    .error {
      color: var(--color-danger);
      padding: var(--spacing-sm);
      background-color: var(--color-danger-light, #fee);
      border-radius: var(--radius-sm);
      margin-bottom: var(--spacing-md);
      font-size: 0.875rem;
    }

    ui-button {
      width: 100%;
    }

    .login-link {
      margin-top: var(--spacing-md);
      text-align: center;
      color: var(--color-text-secondary);

      a {
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class RegisterComponent {
  private authStore = inject(AuthStore);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  async handleRegister() {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authStore.register({
        name: this.name,
        email: this.email,
        password: this.password
      });
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error.set(err.message || 'Registration failed');
    } finally {
      this.loading.set(false);
    }
  }
}
