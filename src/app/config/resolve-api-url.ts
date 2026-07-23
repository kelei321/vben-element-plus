interface AppConfigLike {
  VITE_GLOB_API_URL: string;
}

interface AppConfigWindow extends Window {
  _VBEN_ADMIN_PRO_APP_CONF_: AppConfigLike;
}

function resolveApiUrl(
  env: Record<string, unknown>,
  isProduction: boolean,
): string {
  const config = isProduction
    ? (window as AppConfigWindow)._VBEN_ADMIN_PRO_APP_CONF_
    : (env as unknown as AppConfigLike);

  return config.VITE_GLOB_API_URL;
}

export { resolveApiUrl };
