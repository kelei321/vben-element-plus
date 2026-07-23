interface AppConfigLike {
  VITE_GLOB_API_URL: string;
}

function resolveApiUrl(
  env: Record<string, unknown>,
  isProduction: boolean,
): string {
  const config: AppConfigLike = isProduction
    ? window._VBEN_ADMIN_PRO_APP_CONF_
    : (env as unknown as AppConfigLike);

  return config.VITE_GLOB_API_URL;
}

export { resolveApiUrl };
