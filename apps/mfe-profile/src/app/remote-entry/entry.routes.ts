import { Route } from '@angular/router';
import { RemoteEntryComponent } from './entry';

export const remoteRoutes: Route[] = [
  {
    path: '',
    component: RemoteEntryComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../profile-settings/profile-settings.component').then(
            (m) => m.ProfileSettingsComponent
          ),
      },
      {
        path: 'onboarding',
        loadComponent: () =>
          import('../onboarding/onboarding.component').then(
            (m) => m.OnboardingComponent
          ),
      },
    ],
  },
];
