import { describe, expect, it, vi } from 'vitest';

import { getDirectiveAccessContext } from './get-directive-access-context';

const storeModule = vi.hoisted(() => {
  const accessStore = {
    accessCodes: ['user:read'],
  };
  const userStore = {
    userRoles: ['editor'],
  };

  return {
    accessStore,
    userStore,
    useAccessStore: vi.fn(() => accessStore),
    useUserStore: vi.fn(() => userStore),
  };
});

vi.mock('@vben/stores', () => ({
  useAccessStore: storeModule.useAccessStore,
  useUserStore: storeModule.useUserStore,
}));

describe('getDirectiveAccessContext', () => {
  it('reads the current access codes and user roles from stores', () => {
    expect(getDirectiveAccessContext()).toEqual({
      accessCodes: ['user:read'],
      userRoles: ['editor'],
    });

    storeModule.accessStore.accessCodes = ['user:write'];
    storeModule.userStore.userRoles = ['admin'];

    expect(getDirectiveAccessContext()).toEqual({
      accessCodes: ['user:write'],
      userRoles: ['admin'],
    });
  });
});
