import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

const normalizeUrl = (value: string) => value.replace(/\/+$/, '');

const remoteUrl = (envName: string, fallback: string) => {
  const value = process.env[envName] || fallback;
  return normalizeUrl(value);
};

const productionRemotes: [string, string][] = [
  ['mfe-dashboard', remoteUrl('MFE_DASHBOARD_URL', 'http://localhost:4201')],
  ['mfe-tasks', remoteUrl('MFE_TASKS_URL', 'http://localhost:4202')],
  ['mfe-profile', remoteUrl('MFE_PROFILE_URL', 'http://localhost:4203')],
];

/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
export default withModuleFederation(
  {
    ...config,
    // In production we must not depend on localhost remotes.
    remotes: productionRemotes,
  },
  { dts: false },
);
