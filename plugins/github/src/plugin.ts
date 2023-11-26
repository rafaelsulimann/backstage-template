import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const githubPlugin = createPlugin({
  id: 'github',
  routes: {
    root: rootRouteRef,
  },
});

export const GithubPage = githubPlugin.provide(
  createRoutableExtension({
    name: 'GithubPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
