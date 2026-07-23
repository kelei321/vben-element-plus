import { describe, expect, it, vi } from 'vitest';

import { normalizeGeneratedRoutes } from './normalize-generated-routes';

describe('normalizeGeneratedRoutes', () => {
  it('recursively adds absolute first-child redirects and preserves existing redirects', () => {
    const routes = [
      {
        children: [
          {
            children: [{ path: '/reports/overview/detail' }],
            name: 'Overview',
            path: '/reports/overview',
          },
        ],
        name: 'Reports',
        path: '/reports',
      },
      {
        children: [{ path: '/settings/profile' }],
        name: 'Settings',
        path: '/settings',
        redirect: '/settings/custom',
      },
      {
        children: [{ path: 'details' }],
        name: 'Profile',
        path: '/profile',
      },
    ];

    const result = normalizeGeneratedRoutes(routes as any);

    expect(result).not.toBe(routes);
    expect(result[0]?.redirect).toBe('/reports/overview');
    expect(result[0]?.children?.[0]?.redirect).toBe('/reports/overview/detail');
    expect(result[1]?.redirect).toBe('/settings/custom');
    expect(result[2]?.redirect).toBeUndefined();
  });

  it('wraps keep-alive lazy components with the route name', async () => {
    const originalComponent = vi.fn(async () => ({
      default: { name: 'OriginalComponent' },
    }));
    const route = {
      component: originalComponent,
      meta: { keepAlive: true },
      name: 'CachedRoute',
      path: '/cached',
    };

    normalizeGeneratedRoutes([route] as any);

    const component = await (route.component as () => Promise<any>)();

    expect(originalComponent).toHaveBeenCalledTimes(1);
    expect(component.name).toBe('CachedRoute');
  });

  it('returns lazy component modules without a default export unchanged', async () => {
    const componentModule = { named: 'component' };
    const route = {
      component: vi.fn(async () => componentModule),
      meta: { keepAlive: true },
      name: 'NamedOnlyRoute',
      path: '/named-only',
    };

    normalizeGeneratedRoutes([route] as any);

    await expect(
      (route.component as () => Promise<any>)(),
    ).resolves.toBe(componentModule);
  });

  it('does not wrap components without keep-alive or a string route name', () => {
    const normalComponent = vi.fn();
    const symbolComponent = vi.fn();
    const routes = [
      {
        component: normalComponent,
        name: 'NormalRoute',
        path: '/normal',
      },
      {
        component: symbolComponent,
        meta: { keepAlive: true },
        name: Symbol('SymbolRoute'),
        path: '/symbol',
      },
    ];

    normalizeGeneratedRoutes(routes as any);

    expect(routes[0]?.component).toBe(normalComponent);
    expect(routes[1]?.component).toBe(symbolComponent);
  });
});
