import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateAccessible } from './generate-accessible';

const backend = vi.hoisted(() => ({
  generateRoutesByBackend: vi.fn(),
}));
const frontend = vi.hoisted(() => ({
  generateRoutesByFrontend: vi.fn(),
}));
const menus = vi.hoisted(() => ({
  generateMenus: vi.fn(() => [{ name: 'menu' }]),
}));

vi.mock('./generate-menus', () => menus);
vi.mock('./generate-routes-backend', () => backend);
vi.mock('./generate-routes-frontend', () => frontend);

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

  it('clones configured routes before frontend generation', async () => {
    const router = createRouter();
    const route = {
      meta: { title: 'Original' },
      name: 'OriginalRoute',
      path: '/original',
    };
    const routes = [route];
    frontend.generateRoutesByFrontend.mockImplementationOnce(
      async (generatedRoutes: any[]) => {
        generatedRoutes[0].meta.title = 'Changed';
        return generatedRoutes;
      },
    );

    await generateAccessible('frontend', {
      roles: [],
      router: router as any,
      routes,
    } as any);

    const clonedRoutes = frontend.generateRoutesByFrontend.mock.calls[0]?.[0];
    expect(clonedRoutes).not.toBe(routes);
    expect(clonedRoutes[0]).not.toBe(route);
    expect(route.meta.title).toBe('Original');
  });

  it('generates backend routes and mounts them under the root layout', async () => {
    const router = createRouter();
    const route = { name: 'Dashboard', path: '/dashboard' };
    backend.generateRoutesByBackend.mockResolvedValue([route]);

    const result = await generateAccessible('backend', {
      roles: [],
      router: router as any,
      routes: [],
    } as any);

    expect(backend.generateRoutesByBackend).toHaveBeenCalledTimes(1);
    expect(router.root.children).toEqual([route]);
    expect(router.removeRoute).toHaveBeenCalledWith('Root');
    expect(router.addRoute).toHaveBeenCalledWith(router.root);
    expect(menus.generateMenus).toHaveBeenCalledWith([route], router);
    expect(result).toEqual({
      accessibleMenus: [{ name: 'menu' }],
      accessibleRoutes: [route],
    });
  });

  it('registers generated routes directly when no root layout exists', async () => {
    const route = { name: 'Standalone', path: '/standalone' };
    const router = {
      addRoute: vi.fn(),
      getRoutes: vi.fn(() => []),
      removeRoute: vi.fn(),
    };
    backend.generateRoutesByBackend.mockResolvedValue([route]);

    await generateAccessible('backend', {
      router: router as any,
      routes: [],
    } as any);

    expect(router.addRoute).toHaveBeenCalledTimes(1);
    expect(router.addRoute).toHaveBeenCalledWith(route);
    expect(router.removeRoute).not.toHaveBeenCalled();
  });

  it('registers routes marked outside the basic layout directly', async () => {
    const router = createRouter();
    const route = {
      meta: { noBasicLayout: true },
      name: 'Standalone',
      path: '/standalone',
    };
    backend.generateRoutesByBackend.mockResolvedValue([route]);

    await generateAccessible('backend', {
      router: router as any,
      routes: [],
    } as any);

    expect(router.root.children).toEqual([]);
    expect(router.addRoute).toHaveBeenCalledWith(route);
    expect(router.addRoute).toHaveBeenCalledWith(router.root);
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
    backend.generateRoutesByBackend.mockResolvedValue([replacementRoute]);

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

    frontend.generateRoutesByFrontend.mockResolvedValue([frontendRoute]);
    backend.generateRoutesByBackend.mockResolvedValue([backendRoute]);

    const result = await generateAccessible('mixed', {
      forbiddenComponent,
      roles: ['admin'],
      router: router as any,
      routes: [],
    } as any);

    expect(frontend.generateRoutesByFrontend).toHaveBeenCalledWith(
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
    backend.generateRoutesByBackend.mockResolvedValue(generatedRoutes);

    const result = await generateAccessible('backend', {
      router: router as any,
      routes: [],
    } as any);

    expect(result.accessibleRoutes[0]?.redirect).toBe('/reports/overview');
    expect(result.accessibleRoutes[1]?.redirect).toBe('/settings/custom');
  });

  it('does not add a redirect for a relative first-child path', async () => {
    const router = createRouter();
    const route = {
      children: [{ path: 'details' }],
      name: 'Profile',
      path: '/profile',
    };
    backend.generateRoutesByBackend.mockResolvedValue([route]);

    const result = await generateAccessible('backend', {
      router: router as any,
      routes: [],
    } as any);

    expect(result.accessibleRoutes[0]?.redirect).toBeUndefined();
  });
});
