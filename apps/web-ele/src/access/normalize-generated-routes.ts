import type { Component, DefineComponent } from 'vue';

import type { RouteRecordRaw } from '@vben/types';

import { defineComponent, h } from 'vue';

function normalizeGeneratedRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return routes.map((route) => normalizeRoute(route));
}

function normalizeRoute(route: RouteRecordRaw): RouteRecordRaw {
  if (
    route.meta?.keepAlive &&
    typeof route.component === 'function' &&
    typeof route.name === 'string'
  ) {
    const originalComponent = route.component as () => Promise<{
      default: Component | DefineComponent;
    }>;
    route.component = async () => {
      const component = await originalComponent();
      if (!component.default) return component;
      return defineComponent({
        name: route.name as string,
        setup(props, { attrs, slots }) {
          return () => h(component.default, { ...props, ...attrs }, slots);
        },
      });
    };
  }

  if (!route.redirect && route.children && route.children.length > 0) {
    const firstChild = route.children[0];
    if (firstChild?.path?.startsWith('/')) {
      route.redirect = firstChild.path;
    }
  }

  if (route.children) {
    route.children = route.children.map((child) => normalizeRoute(child));
  }

  return route;
}

export { normalizeGeneratedRoutes };
