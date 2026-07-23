import type { Router, RouteRecordName, RouteRecordRaw } from 'vue-router';

function collectStaticRouteNames(routes: RouteRecordRaw[]): RouteRecordName[] {
  const routeNames: RouteRecordName[] = [];

  const visitRoute = (route: RouteRecordRaw) => {
    if (route.name) {
      routeNames.push(route.name);
    } else {
      console.warn(
        `The route with the path ${route.path} needs to have the field name specified.`,
      );
    }

    route.children?.forEach(visitRoute);
  };

  routes.forEach(visitRoute);

  return routeNames;
}

function resetStaticRoutes(router: Router, routes: RouteRecordRaw[]) {
  const staticRouteNames = collectStaticRouteNames(routes);
  const { getRoutes, hasRoute, removeRoute } = router;

  getRoutes().forEach(({ name }) => {
    if (name && !staticRouteNames.includes(name) && hasRoute(name)) {
      removeRoute(name);
    }
  });
}

export { resetStaticRoutes };
