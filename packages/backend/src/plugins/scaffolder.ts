import { CatalogClient } from '@backstage/catalog-client';
import { createBuiltinActions, createRouter } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import type { PluginEnvironment } from '../types';
import { createGithubRepository } from './scaffolder/actions/createGitHubRepository'
import { ScmIntegrations } from '@backstage/integration';
import { createRepo } from './scaffolder/actions/createRepo';
import { commitSkeleton } from './scaffolder/actions/commitSkeleton';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogClient = new CatalogClient({
    discoveryApi: env.discovery,
  });
  const integrations= ScmIntegrations.fromConfig(env.config);

  const builtInActions = createBuiltinActions({
    integrations,
    catalogClient,
    config: env.config,
    reader: env.reader,
  });

  const config = env.config;

  const actions = [...builtInActions, 
    createGithubRepository(),
    createRepo({integrations}),
    commitSkeleton({integrations, config})
  ];

  return await createRouter({
    actions,
    logger: env.logger,
    config: env.config,
    database: env.database,
    reader: env.reader,
    catalogClient,
    identity: env.identity,
    permissions: env.permissions,
  });
}
