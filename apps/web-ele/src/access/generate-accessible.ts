import type {
  AccessModeType,
  GenerateMenuAndRoutesOptions,
  RouteRecordRaw,
} from '@vben/types';

import { cloneRoutes } from './clone-routes';
import { generateMenus } from './generate-menus';
import { generateRoutesByBackend } from './generate-routes-backend';
import { generateRoutesByFrontend } from './generate-routes-frontend';
import { normalizeGeneratedRoutes } from './normalize-generated-routes';

async function generateAccessible(
  mode: AccessModeType,
  options: GenerateMenuAndRoutesOptions,
) {
  const { router } = options;

  options.routes = cloneRoutes(options.routes);
  const accessibleRoutes = await generateRoutes(mode, options);
  const root = router.getRoutes().find((item) => item.path === '/');
  const names = root?.children?.map((item) => item.name) ?? [];

  accessibleRoutes.forEach((route) => {
    if (root && !route.meta?.noBasicLayout) {
      if (route.children && route.children.length > 0) {
        delete route.component;
      }
      if (names.includes(route.name)) {
        const index = root.children?.findIndex(
          (item) => item.name === route.name,
        );
        if (index !== undefined && index !== -1 && root.children) {
          root.children[index] = route;
        }
      } else {
        root.children?.push(route);
      }
    } else {
      router.addRoute(route);
    }
  });

  if (root) {
    if (root.name) {
      router.removeRoute(root.name);
    }
    router.addRoute(root);
  }

  const accessibleMenus = generateMenus(accessibleRoutes, router);

  return { accessibleMenus, accessibleRoutes };
}

async function generateRoutes(
  mode: AccessModeType,
  options: GenerateMenuAndRoutesOptions,
) {
  const { forbiddenComponent, roles, routes } = options;
  let resultRoutes: RouteRecordRaw[] = routes;

  switch (mode) {
    case 'backend': {
      resultRoutes = await generateRoutesByBackend(options);
      break;
    }
    case 'frontend': {
      resultRoutes = await generateRoutesByFrontend(
        routes,
        roles || [],
        forbiddenComponent,
      );
      break;
    }
    case 'mixed': {
      const [frontendRoutes, backendRoutes] = await Promise.all([
        generateRoutesByFrontend(routes, roles || [], forbiddenComponent),
        generateRoutesByBackend(options),
      ]);
      resultRoutes = [...frontendRoutes, ...backendRoutes];
      break;
    }
  }

  return normalizeGeneratedRoutes(resultRoutes);
}

export { generateAccessible };
