import { preferences } from '@vben/preferences';

function getAccessMode() {
  return preferences.app.accessMode;
}

export { getAccessMode };
