import { describe, expect, it } from 'vitest';

import { formatBearerToken } from './format-bearer-token';

describe('formatBearerToken', () => {
  it('prefixes non-empty tokens with Bearer without trimming', () => {
    expect(formatBearerToken('access-token')).toBe('Bearer access-token');
    expect(formatBearerToken(' access-token ')).toBe('Bearer  access-token ');
  });

  it('returns null for missing tokens', () => {
    expect(formatBearerToken(null)).toBeNull();
    expect(formatBearerToken('')).toBeNull();
  });
});
