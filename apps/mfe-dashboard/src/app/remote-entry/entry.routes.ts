import { Route } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { PreferencesComponent } from '../preferences/preferences.component';

export const remoteRoutes: Route[] = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'preferences',
    component: PreferencesComponent
  }
];
