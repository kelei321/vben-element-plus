import { beforeEach, describe, expect, it, vi } from 'vitest';

const utils = vi.hoisted(() => ({
  cloneDeep: vi.fn((value) => value),
  generateMenus: vi.fn(() => [{ name: 'menu' }]),
  generateRoutesByBackend: vi.fn(),
  generateRoutesByFrontend: vi.fn(),
}));

vi.mock('@vben/utils', () => ({
  ...utils,
  isFunction: (value: unknown) => typeof value === 'function',
  isString: (value: unknown) => typeof value === 'string',
  mapTree: (routes: any[], mapper: (route: any) => any) => {
    const visit = (route: any): any => {
      const next = mapper(route);
      if (next.children) {
        next.children = next.children.map(visit);
      }
      return next;
    };
    return routes.map(visit);
  },
}));

import { generateAccessible } from './generate-accessible';

function createRouter(rootChildren: any[] = []) {
  const root = {
    children: rootChildren,
    name: 'Root',
    path: '/',
  };
  return {
    addRoute: vi.fn(),
    getRoutes: vi.fn(() => [root]),
    removeRoute: vi.fn(),
    root,
  };
}

describe('generateAccessible', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates backend routes and mounts them under the root layout', async () => {
    const router = createRouter();
    const route = { name: 'Dashboard', path: '/dashboard' };
    utils.generateRoutesByBackend.mockResolvedValue([route]);

    const result = await generateAccessible('backend', {
      roles: [],
      router: router as any,
      routes: [],
    } as any);

    expect(utils.generateRoutesByBackend).toHaveBeenCalledTimes(1);
    expect(router.root.children).toEqual([route]);
    expect(router.removeRoute).toHaveBeenCalledWith('Root');
    expect(router.addRoute).toHaveBeenCalledWith(router.root);
    expect(utils.generateMenus).toHaveBeenCalledWith([route], router);
    expect(result).toEqual({
      accessibleMenus: [{ name: 'menu' }],
      accessibleRoutes: [route],
    });
  });

  it('replaces an existing root child with the same route name', async () => {
    const existingRoute = { name: 'Users', path: '/users-old' };
    const router = createRouter([existingRoute]);
    const replacementRoute = {
      children: [{ path: '/users/list' }],
      component: vi.fn(),
      name: 'Users',
      path: '/users',
    };
    utils.generateRoutesByBackend.mockResolvedValue([replacementRoute]);

    await generateAccessible('backend', {
      router: router as any,
      routes: [],
    } as any);

    expect(router.root.children[0]).toBe(replacementRoute);
    expect(replacementRoute.component).toBeUndefined();
  });

  it('uses roles for frontend generation and merges mixed mode in order', async () => {
    const router = createRouter();
    const frontendRoute = { name: 'Frontend', path: '/frontend' };
    const backendRoute = { name: 'Backend', path: '/backend' };
    const forbiddenComponent = vi.fn();

    utils.generateRoutesByFrontend.mockResolvedValue([frontendRoute]);
    utils.generateRoutesByBackend.mockResolvedValue([backendRoute]);

    const result = await generateAccessible('mixed', {
      forbiddenComponent,
      roles: ['admin'],
      router: router as any,
      routes: [],
    } as any);

    expect(utils.generateRoutesByFrontend).toHaveBeenCalledWith(
      [],
      ['admin'],
      forbiddenComponent,
    );
    expect(result.accessibleRoutes).toEqual([frontendRoute, backendRoute]);
  });

  it('adds an absolute first-child redirect without replacing an existing one', async () => {
    const router = createRouter();
    const generatedRoutes = [
      {
        children: [{ path: '/reports/overview' }],
        name: 'Reports',
        path: '/reports',
      },
      {
        children: [{ path: '/settings/profile' }],
        name: 'Settings',
        path: '/settings',
        redirect: '/settings/custom',
      },
    ];
    utils.generateRoutesByBackend.mockResolvedValue(generatedRoutes);

    const result = await generateAccessible('backend', {
      router: router as any,
      routes: [],
    } as any);

    expect(result.accessibleRoutes[0]?.redirect).toBe('/reports/overview');
    expect(result.accessibleRoutes[1]?.redirect).toBe('/settings/custom');
  });
});
