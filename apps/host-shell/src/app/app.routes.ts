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
    path: '**',
    redirectTo: '/dashboard',
  },
];
