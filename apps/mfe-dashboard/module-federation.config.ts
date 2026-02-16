import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'mfe-dashboard',
  exposes: {
    './Routes': 'apps/mfe-dashboard/src/app/remote-entry/entry.routes.ts',
  },
};

export default config;
