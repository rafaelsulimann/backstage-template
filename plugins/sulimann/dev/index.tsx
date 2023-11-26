import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { sulimannPlugin, SulimannPage } from '../src/plugin';

createDevApp()
  .registerPlugin(sulimannPlugin)
  .addPage({
    element: <SulimannPage />,
    title: 'Root Page',
    path: '/sulimann'
  })
  .render();
