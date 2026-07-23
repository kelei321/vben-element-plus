import { afterEach, describe, expect, it, vi } from 'vitest';

import { generateRoutesByBackend } from './generate-routes-backend';

describe('generateRoutesByBackend', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns no routes when no menu loader is configured', async () => {
    await expect(
      generateRoutesByBackend({
        router: {} as any,
        routes: [],
      }),
    ).resolves.toEqual([]);
  });

  it('maps layout and nested page components with normalized paths', async () => {
    const layoutComponent = vi.fn();
    const pageComponent = vi.fn();
    const routes = [
      {
        children: [
          {
            component: 'views/dashboard/index',
            name: 'Dashboard',
            path: 'dashboard',
          },
        ],
        component: 'BasicLayout',
        name: 'Root',
        path: '/',
      },
    ];

    const result = await generateRoutesByBackend({
      fetchMenuListAsync: vi.fn().mockResolvedValue(routes),
      layoutMap: {
        BasicLayout: layoutComponent,
      },
      pageMap: {
        '../views/dashboard/index.vue': pageComponent,
      },
      router: {} as any,
      routes: [],
    });

    expect(result[0]?.component).toBe(layoutComponent);
    expect(result[0]?.children?.[0]?.component).toBe(pageComponent);
  });

  it('uses the not-found page and reports an invalid component', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fallbackComponent = vi.fn();
    const route = {
      component: 'views/missing/page',
      name: 'Missing',
      path: '/missing',
    };

    const result = await generateRoutesByBackend({
      fetchMenuListAsync: vi.fn().mockResolvedValue([route]),
      pageMap: {
        '/_core/fallback/not-found.vue': fallbackComponent,
      },
      router: {} as any,
      routes: [],
    });

    expect(result[0]?.component).toBe(fallbackComponent);
    expect(errorSpy).toHaveBeenCalledWith(
      'route component is invalid: /missing/page.vue',
      route,
    );
  });

  it('reports missing route names without dropping the route', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const route = {
      component: '',
      path: '/unnamed',
    };

    const result = await generateRoutesByBackend({
      fetchMenuListAsync: vi.fn().mockResolvedValue([route]),
      router: {} as any,
      routes: [],
    });

    expect(result).toEqual([route]);
    expect(errorSpy).toHaveBeenCalledWith('route name is required', route);
  });

  it('logs and rethrows menu loading failures', async () => {
    const error = new Error('menu request failed');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      generateRoutesByBackend({
        fetchMenuListAsync: vi.fn().mockRejectedValue(error),
        router: {} as any,
        routes: [],
      }),
    ).rejects.toBe(error);
    expect(errorSpy).toHaveBeenCalledWith(error);
  });
});
