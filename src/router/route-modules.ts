type RouteRecordName = string | symbol;

interface RouteTreeLike {
  children?: RouteTreeLike[];
  name?: RouteRecordName;
  path?: string;
}

interface RouteModule<Route> {
  default?: Route[];
}

function mergeRouteModules<Route>(
  routeModules: Record<string, unknown>,
): Route[] {
  const mergedRoutes: Route[] = [];

  for (const routeModule of Object.values(routeModules)) {
    const moduleRoutes = (routeModule as RouteModule<Route>)?.default ?? [];
    mergedRoutes.push(...moduleRoutes);
  }

  return mergedRoutes;
}

function collectRouteNames(routes: RouteTreeLike[]): RouteRecordName[] {
  const routeNames: RouteRecordName[] = [];

  const visitRoute = (route: RouteTreeLike) => {
    if (route.name) {
      routeNames.push(route.name);
    }

    route.children?.forEach((childRoute) => visitRoute(childRoute));
  };

  routes.forEach((route) => visitRoute(route));

  return routeNames;
}

export { collectRouteNames, mergeRouteModules };
