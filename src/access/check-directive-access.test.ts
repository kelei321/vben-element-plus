import { describe, expect, it } from 'vitest';

import { checkDirectiveAccess } from './check-directive-access';

describe('checkDirectiveAccess', () => {
  it('checks roles for frontend role directives', () => {
    expect(
      checkDirectiveAccess({
        accessCodes: [],
        accessMode: 'frontend',
        argument: 'role',
        requiredAccess: ['admin'],
        userRoles: ['admin'],
      }),
    ).toBe(true);
  });

  it('checks access codes for backend mode and code directives', () => {
    expect(
      checkDirectiveAccess({
        accessCodes: ['user:create'],
        accessMode: 'backend',
        argument: 'role',
        requiredAccess: 'user:create',
        userRoles: ['admin'],
      }),
    ).toBe(true);
    expect(
      checkDirectiveAccess({
        accessCodes: ['user:create'],
        accessMode: 'frontend',
        argument: 'code',
        requiredAccess: ['user:delete'],
        userRoles: [],
      }),
    ).toBe(false);
  });

  it('allows elements when no access value is provided', () => {
    expect(
      checkDirectiveAccess({
        accessCodes: [],
        accessMode: 'frontend',
        userRoles: [],
      }),
    ).toBe(true);
  });
});
