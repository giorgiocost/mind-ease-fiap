import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { clearReturnUrl, getReturnUrl } from '@shared/guards';
import { AuthStore } from '@shared/state';
import { ButtonComponent } from '@shared/ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonComponent],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Login</h1>
        <form (ngSubmit)="handleLogin()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              placeholder="seu@email.com"
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
              placeholder="Sua senha secreta"
              required
              autocomplete="current-password"
            >
          </div>

          @if (error()) {
            <div class="error">{{ error() }}</div>
          }

          <ui-button type="submit" variant="primary" [loading]="loading()">
            Entrar
          </ui-button>
        </form>

        <p class="register-link">
          Não tem conta?
          <a routerLink="/register">Registre-se</a>
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
      width: 100vw;
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
        border: 1px solid var(--color-border-strong);
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
      color: var(--color-error);
      padding: var(--spacing-sm);
      background-color: var(--color-error-light, #fee);
      border-radius: var(--radius-sm);
      margin-bottom: var(--spacing-md);
      font-size: 0.875rem;
    }

    ui-button {
      width: 100%;
    }

    .register-link {
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
export class LoginComponent {
  private authStore = inject(AuthStore);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  async handleLogin() {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authStore.login({ email: this.email, password: this.password });

      // Redirect to intended URL or default
      const returnUrl = getReturnUrl() || '/tasks';
      clearReturnUrl();
      this.router.navigateByUrl(returnUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao realizar login';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
