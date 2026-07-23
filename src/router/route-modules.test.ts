import { describe, expect, it } from 'vitest';

import { collectRouteNames, mergeRouteModules } from './route-modules';

describe('route module utilities', () => {
  it('merges route arrays from module default exports', () => {
    const dashboardRoute = { name: 'Dashboard', path: '/dashboard' };
    const userRoute = { name: 'User', path: '/user' };

    expect(
      mergeRouteModules({
        dashboard: { default: [dashboardRoute] },
        ignored: {},
        user: { default: [userRoute] },
      }),
    ).toEqual([dashboardRoute, userRoute]);
  });

  it('collects named routes from nested route trees', () => {
    const routes = [
      {
        name: 'Root',
        children: [
          {
            name: 'Dashboard',
            children: [{ path: 'unnamed' }],
          },
        ],
      },
    ];

    expect(collectRouteNames(routes)).toEqual(['Root', 'Dashboard']);
  });
});
