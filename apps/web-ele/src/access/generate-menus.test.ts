import { describe, expect, it, vi } from 'vitest';

import { generateMenus } from './generate-menus';

function createRouter(routes: Array<{ name?: string; path: string }>) {
  return {
    getRoutes: vi.fn(() => routes),
  };
}

describe('generateMenus', () => {
  it('maps resolved paths and menu metadata', () => {
    const router = createRouter([
      { name: 'Dashboard', path: '/resolved/dashboard' },
    ]);
    const menus = generateMenus(
      [
        {
          meta: {
            activeIcon: 'dashboard-active',
            badge: '5',
            badgeType: 'dot',
            badgeVariants: 'primary',
            icon: 'dashboard',
            order: 1,
            title: 'Dashboard menu',
          },
          name: 'Dashboard',
          path: '/dashboard',
        },
      ] as any,
      router as any,
    );

    expect(menus).toEqual([
      {
        activeIcon: 'dashboard-active',
        badge: '5',
        badgeType: 'dot',
        badgeVariants: 'primary',
        children: [],
        icon: 'dashboard',
        name: 'Dashboard menu',
        order: 1,
        parent: undefined,
        parents: undefined,
        path: '/resolved/dashboard',
        show: true,
      },
    ]);
  });

  it('sets parent paths for nested menus', () => {
    const router = createRouter([
      { name: 'Projects', path: '/projects' },
      { name: 'ProjectDetail', path: '/projects/detail' },
    ]);
    const routes = [
      {
        children: [
          {
            meta: { title: 'Detail' },
            name: 'ProjectDetail',
            path: 'detail',
          },
        ],
        meta: { title: 'Projects' },
        name: 'Projects',
        parents: ['/workspace'],
        path: '/projects-old',
      },
    ];

    const menus = generateMenus(routes as any, router as any);

    expect(menus[0]?.children?.[0]).toMatchObject({
      name: 'Detail',
      parent: '/projects',
      parents: ['/workspace', '/projects'],
      path: '/projects/detail',
    });
  });

  it('hides children and uses the redirect as the menu path', () => {
    const router = createRouter([{ name: 'Reports', path: '/reports' }]);
    const menus = generateMenus(
      [
        {
          children: [
            {
              meta: { title: 'Overview' },
              name: 'Overview',
              path: 'overview',
            },
          ],
          meta: { hideChildrenInMenu: true, title: 'Reports' },
          name: 'Reports',
          path: '/reports',
          redirect: '/reports/overview',
        },
      ] as any,
      router as any,
    );

    expect(menus[0]).toMatchObject({
      children: [],
      path: '/reports/overview',
    });
  });

  it('uses external links and falls back to the route name', () => {
    const router = createRouter([{ name: 'Docs', path: '/docs' }]);
    const menus = generateMenus(
      [
        {
          meta: {
            link: 'https://example.com/docs',
          },
          name: 'Docs',
          path: '/docs',
        },
      ] as any,
      router as any,
    );

    expect(menus[0]).toMatchObject({
      name: 'Docs',
      path: 'https://example.com/docs',
    });
  });

  it('filters hidden menu trees and sorts top-level order including zero', () => {
    const router = createRouter([]);
    const menus = generateMenus(
      [
        {
          meta: { order: 2, title: 'Second' },
          name: 'Second',
          path: '/second',
        },
        {
          meta: { hideInMenu: true, order: 1, title: 'Hidden' },
          name: 'Hidden',
          path: '/hidden',
          children: [
            {
              meta: { title: 'Hidden child' },
              name: 'HiddenChild',
              path: 'child',
            },
          ],
        },
        {
          meta: { order: 0, title: 'First' },
          name: 'First',
          path: '/first',
        },
      ] as any,
      router as any,
    );

    expect(menus.map(({ name }) => name)).toEqual(['First', 'Second']);
  });
});
