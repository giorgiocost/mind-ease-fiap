import { Route } from '@angular/router';

export const remoteRoutes: Route[] = [
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
];
