type RouteRecordName = string | symbol;

interface RouteRecordLike {
  children?: RouteRecordLike[];
  name?: RouteRecordName;
  path: string;
}

interface RouterLike {
  getRoutes: () => Array<{ name?: RouteRecordName }>;
  hasRoute: (name: RouteRecordName) => boolean;
  removeRoute: (name: RouteRecordName) => void;
}

function collectStaticRouteNames(routes: RouteRecordLike[]): RouteRecordName[] {
  const routeNames: RouteRecordName[] = [];

  const visitRoute = (route: RouteRecordLike) => {
    if (route.name) {
      routeNames.push(route.name);
    } else {
      console.warn(
        `The route with the path ${route.path} needs to have the field name specified.`,
      );
    }

    route.children?.forEach((childRoute) => visitRoute(childRoute));
  };

  routes.forEach((route) => visitRoute(route));

  return routeNames;
}

function resetStaticRoutes(router: RouterLike, routes: RouteRecordLike[]) {
  const staticRouteNames = collectStaticRouteNames(routes);
  const { getRoutes, hasRoute, removeRoute } = router;

  getRoutes().forEach(({ name }) => {
    if (name && !staticRouteNames.includes(name) && hasRoute(name)) {
      removeRoute(name);
    }
  });
}

export { resetStaticRoutes };
