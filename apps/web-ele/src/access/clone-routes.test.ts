import { describe, expect, it, vi } from 'vitest';

import { cloneRoutes } from './clone-routes';

describe('cloneRoutes', () => {
  it('clones route records while preserving functions', () => {
    const component = vi.fn();
    const beforeEnter = vi.fn();
    const route = {
      beforeEnter,
      children: [
        {
          component,
          meta: { permissions: ['read'] },
          name: 'RouteChild',
          path: 'child',
        },
      ],
      component,
      meta: {
        settings: {
          labels: ['primary'],
        },
      },
      name: 'RouteRoot',
      path: '/root',
    };
    const routes = [route];

    const cloned = cloneRoutes(routes as any);

    expect(cloned).not.toBe(routes);
    expect(cloned[0]).not.toBe(route);
    expect(cloned[0]?.children?.[0]).not.toBe(route.children[0]);
    expect(cloned[0]?.meta).not.toBe(route.meta);
    expect(cloned[0]?.component).toBe(component);
    expect(cloned[0]?.beforeEnter).toBe(beforeEnter);

    const clonedSettings = cloned[0]?.meta?.settings as {
      labels: string[];
    };
    const clonedChild = cloned[0]?.children?.[0];
    if (!clonedChild) {
      throw new Error('Expected cloned child route');
    }
    clonedSettings.labels.push('secondary');
    clonedChild.path = 'changed';

    expect(route.meta.settings.labels).toEqual(['primary']);
    expect(route.children[0]?.path).toBe('child');
  });

  it('preserves object graphs and supported built-in values', () => {
    class RoutePayload {
      enabled = true;
    }

    const metadataKey = Symbol('metadata');
    const shared = { enabled: true };
    const pattern = /route/gi;
    pattern.lastIndex = 2;
    const meta: Record<PropertyKey, any> = {
      createdAt: new Date('2026-07-23T00:00:00.000Z'),
      payload: new RoutePayload(),
      pattern,
      shared,
      sharedMap: new Map([['value', shared]]),
      sharedSet: new Set([shared]),
    };
    meta.self = meta;
    meta[metadataKey] = { label: 'symbol' };

    const [clonedRoute] = cloneRoutes([
      { meta, name: 'ComplexRoute', path: '/complex' } as any,
    ]);
    const clonedMeta = clonedRoute?.meta as typeof meta;

    expect(clonedMeta).not.toBe(meta);
    expect(clonedMeta.self).toBe(clonedMeta);
    expect(clonedMeta.createdAt).not.toBe(meta.createdAt);
    expect(clonedMeta.createdAt).toEqual(meta.createdAt);
    expect(clonedMeta.pattern).not.toBe(pattern);
    expect(clonedMeta.pattern.lastIndex).toBe(2);
    expect(clonedMeta.payload).toBeInstanceOf(RoutePayload);
    expect(clonedMeta.payload).not.toBe(meta.payload);
    expect(clonedMeta.sharedMap.get('value')).toBe(clonedMeta.shared);
    expect([...clonedMeta.sharedSet][0]).toBe(clonedMeta.shared);
    expect(clonedMeta[metadataKey]).not.toBe(meta[metadataKey]);
    expect(clonedMeta[metadataKey]).toEqual(meta[metadataKey]);
  });
});
