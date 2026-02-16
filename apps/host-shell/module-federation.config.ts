import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'host-shell',
  remotes: ['mfe-dashboard', 'mfe-tasks', 'mfe-profile'],
};

export default config;
