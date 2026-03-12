import { Route } from '@angular/router';

export const remoteRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('../tasks/tasks.component').then(m => m.TasksComponent),
    title: 'MindEase'
  },
  {
    path: 'pomodoro',
    loadComponent: () =>
      import('../pomodoro/pomodoro.component').then(m => m.PomodoroComponent),
    title: 'MindEase'
  }
];
