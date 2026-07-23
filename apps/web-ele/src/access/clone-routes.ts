import type { RouteRecordRaw } from '@vben/types';

const objectToString = Object.prototype.toString;

function getEnumerableKeys(value: object): PropertyKey[] {
  const symbolKeys = Object.getOwnPropertySymbols(value).filter((key) =>
    Object.prototype.propertyIsEnumerable.call(value, key),
  );
  return [...Object.keys(value), ...symbolKeys];
}

function cloneValue<T>(value: T, seen: WeakMap<object, unknown>): T {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  const cached = seen.get(value);
  if (cached) {
    return cached as T;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (value instanceof RegExp) {
    const cloned = new RegExp(value.source, value.flags);
    cloned.lastIndex = value.lastIndex;
    return cloned as T;
  }

  if (value instanceof Map) {
    const cloned = new Map();
    seen.set(value, cloned);
    value.forEach((item, key) => {
      cloned.set(key, cloneValue(item, seen));
    });
    return cloned as T;
  }

  if (value instanceof Set) {
    const cloned = new Set();
    seen.set(value, cloned);
    value.forEach((item) => {
      cloned.add(cloneValue(item, seen));
    });
    return cloned as T;
  }

  const isArray = Array.isArray(value);
  if (!isArray && objectToString.call(value) !== '[object Object]') {
    return value;
  }

  const cloned = isArray ? [] : Object.create(Object.getPrototypeOf(value));
  seen.set(value, cloned);

  for (const key of getEnumerableKeys(value)) {
    cloned[key] = cloneValue(value[key as keyof T], seen);
  }

  return cloned as T;
}

function cloneRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return cloneValue(routes, new WeakMap());
}

export { cloneRoutes };
