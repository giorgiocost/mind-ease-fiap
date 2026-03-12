import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'host-shell',
  remotes: ['mfe-dashboard', 'mfe-tasks', 'mfe-profile'],
  additionalShared: [
    ['@angular/router', { singleton: true, strictVersion: false, requiredVersion: false }],
    ['@angular/forms', { singleton: true, strictVersion: false, requiredVersion: false }],
  ],
};

export default config;
