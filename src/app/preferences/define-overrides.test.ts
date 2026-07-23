import { describe, expect, it } from 'vitest';

import { defineOverridesPreferences } from './define-overrides';

describe('defineOverridesPreferences', () => {
  it('returns the original preference override object', () => {
    const overrides = {
      app: {
        name: 'Vben Element Plus',
      },
    };

    expect(defineOverridesPreferences(overrides)).toBe(overrides);
  });
});
