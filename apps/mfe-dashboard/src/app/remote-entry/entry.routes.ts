import { Route } from '@angular/router';

export const remoteRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./entry.component').then(m => m.RemoteEntryComponent)
  }
];
