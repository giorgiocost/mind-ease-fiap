import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'mfe-tasks',
  exposes: {
    './Routes': 'apps/mfe-tasks/src/app/remote-entry/entry.routes.ts'
  },
  additionalShared: [
    ['@angular/router', { singleton: true, strictVersion: false, requiredVersion: false }],
    ['@angular/forms', { singleton: true, strictVersion: false, requiredVersion: false }],
  ],
};

export default config;
