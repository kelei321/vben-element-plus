import { describe, expect, it } from 'vitest';

import { LOGIN_PATH } from './constants';

describe('router constants', () => {
  it('keeps the login route contract stable', () => {
    expect(LOGIN_PATH).toBe('/auth/login');
  });
});
