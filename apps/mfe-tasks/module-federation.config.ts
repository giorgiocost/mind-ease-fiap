import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'mfe-tasks',
  exposes: {
    './Routes': 'apps/mfe-tasks/src/app/remote-entry/entry.routes.ts'
  },
};

export default config;
