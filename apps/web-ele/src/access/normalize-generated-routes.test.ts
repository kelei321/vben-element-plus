import { describe, expect, it, vi } from 'vitest';

import { normalizeGeneratedRoutes } from './normalize-generated-routes';

describe('normalizeGeneratedRoutes', () => {
  it('adds nested absolute redirects and preserves existing redirects', () => {
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
    const nestedRedirect = result[0]?.children?.[0]?.redirect;

    expect(result).not.toBe(routes);
    expect(result[0]?.redirect).toBe('/reports/overview');
    expect(nestedRedirect).toBe('/reports/overview/detail');
    expect(result[1]?.redirect).toBe('/settings/custom');
    expect(result[2]?.redirect).toBeUndefined();
  });

  it('wraps keep-alive lazy components with route names', async () => {
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
    const loadComponent = route.component as () => Promise<any>;
    const component = await loadComponent();

    expect(originalComponent).toHaveBeenCalledTimes(1);
    expect(component.name).toBe('CachedRoute');
  });

  it('preserves lazy component modules without default exports', async () => {
    const componentModule = { named: 'component' };
    const route = {
      component: vi.fn(async () => componentModule),
      meta: { keepAlive: true },
      name: 'NamedOnlyRoute',
      path: '/named-only',
    };

    normalizeGeneratedRoutes([route] as any);
    const loadComponent = route.component as () => Promise<any>;
    const component = await loadComponent();

    expect(component).toBe(componentModule);
  });

  it('skips components without keep-alive or string route names', () => {
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
