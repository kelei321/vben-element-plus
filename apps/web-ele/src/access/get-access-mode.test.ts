import { describe, expect, it, vi } from 'vitest';

import { getAccessMode } from './get-access-mode';

const preferenceModule = vi.hoisted(() => ({
  preferences: {
    app: {
      accessMode: 'frontend',
    },
  },
}));

vi.mock('@vben/preferences', () => preferenceModule);

describe('getAccessMode', () => {
  it('reads the current access mode from preferences', () => {
    expect(getAccessMode()).toBe('frontend');

    preferenceModule.preferences.app.accessMode = 'backend';

    expect(getAccessMode()).toBe('backend');
  });
});
