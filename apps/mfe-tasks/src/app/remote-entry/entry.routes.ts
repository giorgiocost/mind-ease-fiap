import { Route } from '@angular/router';

export const remoteRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./entry.component').then(m => m.RemoteEntryComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../tasks/tasks-list.component').then(m => m.TasksListComponent)
      },
      {
        path: 'pomodoro',
        loadComponent: () =>
          import('../pomodoro/pomodoro.component').then(m => m.PomodoroComponent)
      }
    ]
  }
];
