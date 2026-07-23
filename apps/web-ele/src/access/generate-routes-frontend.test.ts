import { describe, expect, it, vi } from 'vitest';

import {
  generateRoutesByFrontend,
  hasAuthority,
} from './generate-routes-frontend';

describe('generateRoutesByFrontend', () => {
  it('keeps unrestricted routes and filters unauthorized nested routes', async () => {
    const routes = [
      {
        children: [
          {
            meta: { authority: ['admin'] },
            name: 'AdminChild',
            path: 'admin',
          },
          {
            meta: { authority: ['user'] },
            name: 'UserChild',
            path: 'user',
          },
        ],
        name: 'Root',
        path: '/root',
      },
    ];

    const result = await generateRoutesByFrontend(routes as any, ['user']);

    expect(result).toHaveLength(1);
    expect(result[0]?.children?.map((route) => route.name)).toEqual([
      'UserChild',
    ]);
  });

  it('keeps forbidden-visible routes and replaces their component', async () => {
    const originalComponent = vi.fn();
    const forbiddenComponent = vi.fn();
    const route = {
      component: originalComponent,
      meta: {
        authority: ['admin'],
        menuVisibleWithForbidden: true,
      },
      name: 'Admin',
      path: '/admin',
    };

    const result = await generateRoutesByFrontend(
      [route] as any,
      ['user'],
      forbiddenComponent,
    );

    expect(result).toEqual([route]);
    expect(result[0]?.component).toBe(forbiddenComponent);
  });

  it('does not replace authorized route components', async () => {
    const component = vi.fn();
    const forbiddenComponent = vi.fn();
    const route = {
      component,
      meta: {
        authority: ['admin'],
        menuVisibleWithForbidden: false,
      },
      name: 'Admin',
      path: '/admin',
    };

    const result = await generateRoutesByFrontend(
      [route] as any,
      ['admin'],
      forbiddenComponent,
    );

    expect(result[0]?.component).toBe(component);
  });
});

describe('hasAuthority', () => {
  it('allows routes without authority metadata', () => {
    expect(hasAuthority({ path: '/public' } as any, [])).toBe(true);
  });

  it('allows any matching role', () => {
    expect(
      hasAuthority(
        { meta: { authority: ['admin', 'editor'] }, path: '/editor' } as any,
        ['viewer', 'editor'],
      ),
    ).toBe(true);
  });

  it('keeps denied routes only when forbidden menu visibility is enabled', () => {
    expect(
      hasAuthority(
        {
          meta: {
            authority: ['admin'],
            menuVisibleWithForbidden: true,
          },
          path: '/admin',
        } as any,
        ['user'],
      ),
    ).toBe(true);

    expect(
      hasAuthority(
        {
          meta: {
            authority: ['admin'],
            menuVisibleWithForbidden: false,
          },
          path: '/admin',
        } as any,
        ['user'],
      ),
    ).toBe(false);
  });
});
