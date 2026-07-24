import type { App, Directive, DirectiveBinding } from 'vue';

import { useAccessStore, useUserStore } from '@vben/stores';

import { checkDirectiveAccess } from '../../../../src/access/check-directive-access';
import { getAccessMode } from './get-access-mode';

function isAccessible(
  element: Element,
  binding: DirectiveBinding<string | string[]>,
) {
  const accessStore = useAccessStore();
  const userStore = useUserStore();

  const accessible = checkDirectiveAccess({
    accessCodes: accessStore.accessCodes,
    accessMode: getAccessMode(),
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
