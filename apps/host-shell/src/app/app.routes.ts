import { Route } from '@angular/router';
import { authGuard } from '@shared/guards';

export const appRoutes: Route[] = [
  {
    path: 'mfeDashboard',
    loadChildren: () =>
      import('mfeDashboard/Routes').then((m) => m!.remoteRoutes),
  },
  // Default redirect
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  // Public routes (authentication)
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register.component').then((m) => m.RegisterComponent),
  },

  // Protected routes (MFE remotes)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('mfe-dashboard/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadChildren: () => import('mfe-tasks/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () =>
      import('mfe-profile/Routes').then((m) => m!.remoteRoutes),
  },

  // Dev demo routes (protected for consistency)
  {
    path: 'button-demo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./button-demo/button-demo.component').then(
        (m) => m.ButtonDemoComponent,
      ),
  },
  {
    path: 'input-demo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./input-demo/input-demo.component').then(
        (m) => m.InputDemoComponent,
      ),
  },
  {
    path: 'card-demo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./card-demo/card-demo.component').then(
        (m) => m.CardDemoComponent,
      ),
  },
  {
    path: 'modal-demo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modal-demo/modal-demo.component').then(
        (m) => m.ModalDemoComponent,
      ),
  },

  // 404 fallback
  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];
