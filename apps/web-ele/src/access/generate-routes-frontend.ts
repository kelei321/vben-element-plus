import type { RouteRecordRaw } from '@vben/types';

function generateRoutesByFrontend(
  routes: RouteRecordRaw[],
  roles: string[],
  forbiddenComponent?: RouteRecordRaw['component'],
): Promise<RouteRecordRaw[]> {
  const finalRoutes = filterAccessibleRoutes(routes, roles);

  if (!forbiddenComponent) {
    return Promise.resolve(finalRoutes);
  }

  return Promise.resolve(
    mapRouteTree(finalRoutes, (route) => {
      if (menuHasVisibleWithForbidden(route)) {
        route.component = forbiddenComponent;
      }
      return route;
    }),
  );
}

function filterAccessibleRoutes(
  routes: RouteRecordRaw[],
  roles: string[],
): RouteRecordRaw[] {
  return routes.filter((route) => {
    if (!hasAuthority(route, roles)) {
      return false;
    }

    if (route.children) {
      route.children = filterAccessibleRoutes(route.children, roles);
    }
    return true;
  });
}

function mapRouteTree(
  routes: RouteRecordRaw[],
  mapper: (route: RouteRecordRaw) => RouteRecordRaw,
): RouteRecordRaw[] {
  return routes.map((route) => {
    const mappedRoute = mapper(route);
    if (mappedRoute.children) {
      mappedRoute.children = mapRouteTree(mappedRoute.children, mapper);
    }
    return mappedRoute;
  });
}

function hasAuthority(route: RouteRecordRaw, roles: string[]) {
  const authority = route.meta?.authority;
  if (!authority) {
    return true;
  }

  const canAccess = roles.some((role) => authority.includes(role));
  return canAccess || menuHasVisibleWithForbidden(route);
}

function menuHasVisibleWithForbidden(route: RouteRecordRaw) {
  return (
    !!route.meta?.authority &&
    Reflect.has(route.meta || {}, 'menuVisibleWithForbidden') &&
    !!route.meta?.menuVisibleWithForbidden
  );
}

export { generateRoutesByFrontend, hasAuthority };
