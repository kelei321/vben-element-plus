import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  RouteRecordRaw,
  RouteRecordStringComponent,
} from '@vben/types';

async function generateRoutesByBackend(
  options: GenerateMenuAndRoutesOptions,
): Promise<RouteRecordRaw[]> {
  const { fetchMenuListAsync, layoutMap = {}, pageMap = {} } = options;

  try {
    const menuRoutes = await fetchMenuListAsync?.();
    if (!menuRoutes) {
      return [];
    }

    const normalizedPageMap: ComponentRecordType = {};

    for (const [key, value] of Object.entries(pageMap)) {
      normalizedPageMap[normalizeViewPath(key)] = value;
    }

    return convertRoutes(menuRoutes, layoutMap, normalizedPageMap);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function convertRoutes(
  routes: RouteRecordStringComponent[],
  layoutMap: ComponentRecordType,
  pageMap: ComponentRecordType,
): RouteRecordRaw[] {
  return mapRouteTree(routes, (node) => {
    const route = node as unknown as RouteRecordRaw;
    const { component, name } = node;

    if (!name) {
      console.error('route name is required', route);
    }

    if (component && layoutMap[component]) {
      route.component = layoutMap[component];
    } else if (component) {
      const normalizedPath = normalizeViewPath(component);
      const pageKey = normalizedPath.endsWith('.vue')
        ? normalizedPath
        : `${normalizedPath}.vue`;

      if (pageMap[pageKey]) {
        route.component = pageMap[pageKey];
      } else {
        console.error(`route component is invalid: ${pageKey}`, route);
        route.component = pageMap['/_core/fallback/not-found.vue'];
      }
    }

    return route;
  });
}

function mapRouteTree(
  routes: RouteRecordStringComponent[],
  mapper: (route: RouteRecordStringComponent) => RouteRecordRaw,
): RouteRecordRaw[] {
  return routes.map((route) => {
    const mappedRoute = mapper(route);
    if (route.children) {
      mappedRoute.children = mapRouteTree(route.children, mapper);
    }
    return mappedRoute;
  });
}

function normalizeViewPath(path: string): string {
  const normalizedPath = path.replace(/^(\.\/|\.\.\/)+/, '');
  const viewPath = normalizedPath.startsWith('/')
    ? normalizedPath
    : `/${normalizedPath}`;

  return viewPath.replace(/^\/views/, '');
}

export { generateRoutesByBackend, normalizeViewPath };
