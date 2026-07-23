import type { Router, RouteRecordRaw } from 'vue-router';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { resetStaticRoutes } from './reset-routes';

function createRouterStub(routeNames: string[]) {
  const removeRoute = vi.fn();
  const hasRoute = vi.fn(() => true);
  const router = {
    getRoutes: () => routeNames.map((name) => ({ name })),
    hasRoute,
    removeRoute,
  } as unknown as Router;

  return { hasRoute, removeRoute, router };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('resetStaticRoutes', () => {
  it('removes routes that are not part of the static route tree', () => {
    const { removeRoute, router } = createRouterStub([
      'dashboard',
      'dashboard-detail',
      'dynamic-user',
    ]);
    const routes: RouteRecordRaw[] = [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: {},
        children: [
          {
            path: 'detail',
            name: 'dashboard-detail',
            component: {},
          },
        ],
      },
    ];

    resetStaticRoutes(router, routes);

    expect(removeRoute).toHaveBeenCalledTimes(1);
    expect(removeRoute).toHaveBeenCalledWith('dynamic-user');
  });

  it('warns when a static route has no name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { router } = createRouterStub([]);
    const routes: RouteRecordRaw[] = [
      {
        path: '/unnamed',
        component: {},
      },
    ];

    resetStaticRoutes(router, routes);

    expect(warn).toHaveBeenCalledWith(
      'The route with the path /unnamed needs to have the field name specified.',
    );
  });
});
