import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { githubPlugin, GithubPage } from '../src/plugin';

createDevApp()
  .registerPlugin(githubPlugin)
  .addPage({
    element: <GithubPage />,
    title: 'Root Page',
    path: '/github'
  })
  .render();
