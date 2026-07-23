import { initPreferences } from '@vben/preferences';

import { bootstrap } from '../apps/web-ele/src/bootstrap';
import { overridesPreferences } from '../apps/web-ele/src/preferences';
import { unmountGlobalLoading } from './shared/utils/loading';

async function initApplication() {
  const env = import.meta.env.PROD ? 'prod' : 'dev';
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;

  await initPreferences({
    namespace,
    overrides: overridesPreferences,
  });

  await bootstrap(namespace);
  unmountGlobalLoading();
}

void initApplication();
