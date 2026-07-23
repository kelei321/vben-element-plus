import { afterEach, describe, expect, it } from 'vitest';

import { resolveApiUrl } from './resolve-api-url';

interface TestAppConfigWindow extends Window {
  _VBEN_ADMIN_PRO_APP_CONF_?: {
    VITE_GLOB_API_URL: string;
  };
}

const appWindow = window as TestAppConfigWindow;
const originalConfig = appWindow._VBEN_ADMIN_PRO_APP_CONF_;

afterEach(() => {
  if (originalConfig) {
    appWindow._VBEN_ADMIN_PRO_APP_CONF_ = originalConfig;
  } else {
    delete appWindow._VBEN_ADMIN_PRO_APP_CONF_;
  }
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
    appWindow._VBEN_ADMIN_PRO_APP_CONF_ = {
      VITE_GLOB_API_URL: 'https://prod.example.com/api',
    };

    expect(resolveApiUrl({}, true)).toBe('https://prod.example.com/api');
  });
});
