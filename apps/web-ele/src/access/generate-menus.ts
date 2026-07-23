import type {
  GenerateMenuAndRoutesOptions,
  MenuRecordRaw,
  RouteMeta,
  RouteRecordRaw,
} from '@vben/types';

type MenuRouteRecord = RouteRecordRaw & {
  parent?: string;
  parents?: string[];
};

function generateMenus(
  routes: RouteRecordRaw[],
  router: Pick<GenerateMenuAndRoutesOptions['router'], 'getRoutes'>,
): MenuRecordRaw[] {
  const finalRoutesMap: Record<string, string> = Object.fromEntries(
    router.getRoutes().map(({ name, path }) => [name, path]),
  );

  const menus = mapMenuTree(routes as MenuRouteRecord[], (route) => {
    const path = finalRoutesMap[route.name as string] ?? route.path ?? '';
    const {
      children = [],
      meta = {} as RouteMeta,
      name: routeName,
      redirect,
    } = route;
    const {
      activeIcon,
      badge,
      badgeType,
      badgeVariants,
      hideChildrenInMenu = false,
      icon,
      link,
      order,
      title = '',
    } = meta;
    const name = (title || routeName || '') as string;
    const resultChildren = hideChildrenInMenu
      ? []
      : (children as unknown as MenuRecordRaw[]);

    if (resultChildren.length > 0) {
      resultChildren.forEach((child) => {
        child.parents = [...(route.parents ?? []), path];
        child.parent = path;
      });
    }

    const resultPath = hideChildrenInMenu ? redirect || path : link || path;

    return {
      activeIcon,
      badge,
      badgeType,
      badgeVariants,
      children: resultChildren,
      icon,
      name,
      order,
      parent: route.parent,
      parents: route.parents,
      path: resultPath as MenuRecordRaw['path'],
      show: !meta.hideInMenu,
    };
  });

  menus.sort((first, second) => (first.order ?? 999) - (second.order ?? 999));

  return filterVisibleMenus(menus);
}

function mapMenuTree(
  routes: MenuRouteRecord[],
  mapper: (route: MenuRouteRecord) => MenuRecordRaw,
): MenuRecordRaw[] {
  return routes.map((route) => {
    const menu = mapper(route);
    if (menu.children) {
      menu.children = mapMenuTree(
        menu.children as unknown as MenuRouteRecord[],
        mapper,
      );
    }
    return menu;
  });
}

function filterVisibleMenus(menus: MenuRecordRaw[]): MenuRecordRaw[] {
  return menus.filter((menu) => {
    if (!menu.show) {
      return false;
    }
    if (menu.children) {
      menu.children = filterVisibleMenus(menu.children);
    }
    return true;
  });
}

export { generateMenus };
