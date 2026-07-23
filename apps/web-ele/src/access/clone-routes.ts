import type { RouteRecordRaw } from '@vben/types';

type CloneRecord = Record<PropertyKey, unknown>;

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
    const cloned = new Date(value.getTime());
    seen.set(value, cloned);
    return cloned as T;
  }

  if (value instanceof RegExp) {
    const cloned = new RegExp(value.source, value.flags);
    cloned.lastIndex = value.lastIndex;
    seen.set(value, cloned);
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

  const source = value as CloneRecord;
  let cloned: CloneRecord;
  if (isArray) {
    cloned = new Array(value.length) as unknown as CloneRecord;
  } else {
    cloned = Object.create(Object.getPrototypeOf(value)) as CloneRecord;
  }
  seen.set(value, cloned);

  for (const key of getEnumerableKeys(value)) {
    cloned[key] = cloneValue(source[key], seen);
  }

  return cloned as T;
}

function cloneRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return cloneValue(routes, new WeakMap());
}

export { cloneRoutes };
