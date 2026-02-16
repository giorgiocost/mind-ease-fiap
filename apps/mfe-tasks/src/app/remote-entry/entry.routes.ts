import { Route } from '@angular/router';
import { authGuard } from '@shared/guards';

export const remoteRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./entry.component').then(m => m.RemoteEntryComponent),
    children: [
      {
        path: '',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../tasks/tasks.component').then(m => m.TasksComponent),
        title: 'My Tasks | MindEase'
      },
      {
        path: 'pomodoro',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../pomodoro/pomodoro.component').then(m => m.PomodoroComponent),
        title: 'Pomodoro Timer | MindEase'
      }
    ]
  }
];
