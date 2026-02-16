import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '@shared/ui';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, ButtonComponent],
  template: `
    <div class="not-found">
      <h1>404</h1>
      <p>Página não encontrada</p>
      <ui-button routerLink="/dashboard" variant="primary">
        Voltar para Dashboard
      </ui-button>
    </div>
  `,
  styles: [`
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      background-color: var(--color-background);
      padding: var(--spacing-md);

      h1 {
        font-size: 6rem;
        font-weight: 700;
        color: var(--color-primary);
        margin: 0;
        line-height: 1;
      }

      p {
        font-size: 1.5rem;
        color: var(--color-text-secondary);
        margin: var(--spacing-md) 0 var(--spacing-xl);
      }
    }
  `]
})
export class NotFoundComponent {}
