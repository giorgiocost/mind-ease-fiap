import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'mfe-dashboard',
  exposes: {
    './Routes': 'apps/mfe-dashboard/src/app/remote-entry/entry.routes.ts',
  },
  additionalShared: [
    ['@angular/router', { singleton: true, strictVersion: false, requiredVersion: false }],
    ['@angular/forms', { singleton: true, strictVersion: false, requiredVersion: false }],
  ],
};

export default config;
