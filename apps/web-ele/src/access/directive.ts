import type { App, Directive, DirectiveBinding } from 'vue';

import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';

import { checkDirectiveAccess } from '../../../../src/access/check-directive-access';

function isAccessible(
  element: Element,
  binding: DirectiveBinding<string | string[]>,
) {
  const accessStore = useAccessStore();
  const userStore = useUserStore();

  const accessible = checkDirectiveAccess({
    accessCodes: accessStore.accessCodes,
    accessMode: preferences.app.accessMode,
    argument: binding.arg,
    requiredAccess: binding.value,
    userRoles: userStore.userRoles,
  });

  if (!accessible) {
    element.remove();
  }
}

const accessDirective: Directive = {
  mounted: isAccessible,
};

function registerAccessDirective(app: App) {
  app.directive('access', accessDirective);
}

export { registerAccessDirective };
