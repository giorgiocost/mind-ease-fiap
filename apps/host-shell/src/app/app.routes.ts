import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('mfe-dashboard/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'tasks',
    loadChildren: () =>
      import('mfe-tasks/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('mfe-profile/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'button-demo',
    loadComponent: () =>
      import('./button-demo/button-demo.component').then(
        (m) => m.ButtonDemoComponent
      ),
  },
  {
    path: 'input-demo',
    loadComponent: () =>
      import('./input-demo/input-demo.component').then(
        (m) => m.InputDemoComponent
      ),
  },
  {
    path: 'card-demo',
    loadComponent: () =>
      import('./card-demo/card-demo.component').then(
        (m) => m.CardDemoComponent
      ),
  },
  {
    path: 'modal-demo',
    loadComponent: () =>
      import('./modal-demo/modal-demo.component').then(
        (m) => m.ModalDemoComponent
      ),
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
