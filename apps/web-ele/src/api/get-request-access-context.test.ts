import { describe, expect, it, vi } from 'vitest';

import { getRequestAccessContext } from './get-request-access-context';

const storeModule = vi.hoisted(() => {
  const accessStore = {
    accessToken: 'token-a' as null | string,
    isAccessChecked: true,
    setAccessToken: vi.fn(),
    setLoginExpired: vi.fn(),
  };

  return {
    accessStore,
    useAccessStore: vi.fn(() => accessStore),
  };
});

vi.mock('@vben/stores', () => ({
  useAccessStore: storeModule.useAccessStore,
}));

describe('getRequestAccessContext', () => {
  it('reads current request access state and delegates writes', () => {
    const firstContext = getRequestAccessContext();

    expect(firstContext.accessToken).toBe('token-a');
    expect(firstContext.isAccessChecked).toBe(true);

    firstContext.setAccessToken(null);
    firstContext.setLoginExpired(true);

    expect(storeModule.accessStore.setAccessToken).toHaveBeenCalledWith(null);
    expect(storeModule.accessStore.setLoginExpired).toHaveBeenCalledWith(true);

    storeModule.accessStore.accessToken = 'token-b';
    storeModule.accessStore.isAccessChecked = false;

    const secondContext = getRequestAccessContext();

    expect(secondContext.accessToken).toBe('token-b');
    expect(secondContext.isAccessChecked).toBe(false);
    expect(storeModule.useAccessStore).toHaveBeenCalledTimes(2);
  });
});
