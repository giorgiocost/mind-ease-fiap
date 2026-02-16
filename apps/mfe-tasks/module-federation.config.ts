import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'mfe-tasks',
  exposes: {
    './Routes': './src/app/remote-entry/entry.routes.ts'
  },
};

export default config;
