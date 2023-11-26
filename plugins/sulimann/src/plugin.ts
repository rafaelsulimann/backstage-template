import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const sulimannPlugin = createPlugin({
  id: 'sulimann',
  routes: {
    root: rootRouteRef,
  },
});

export const SulimannPage = sulimannPlugin.provide(
  createRoutableExtension({
    name: 'SulimannPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
