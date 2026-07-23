import { afterEach, describe, expect, it } from 'vitest';

import { resolveApiUrl } from './resolve-api-url';

const originalConfig = window._VBEN_ADMIN_PRO_APP_CONF_;

afterEach(() => {
  window._VBEN_ADMIN_PRO_APP_CONF_ = originalConfig;
});

describe('resolveApiUrl', () => {
  it('reads the API URL from Vite environment values in development', () => {
    expect(
      resolveApiUrl(
        {
          VITE_GLOB_API_URL: 'https://dev.example.com/api',
        },
        false,
      ),
    ).toBe('https://dev.example.com/api');
  });

  it('reads the injected global API URL in production', () => {
    window._VBEN_ADMIN_PRO_APP_CONF_ = {
      VITE_GLOB_API_URL: 'https://prod.example.com/api',
      VITE_GLOB_AUTH_DINGDING_CLIENT_ID: '',
      VITE_GLOB_AUTH_DINGDING_CORP_ID: '',
    };

    expect(resolveApiUrl({}, true)).toBe('https://prod.example.com/api');
  });
});
