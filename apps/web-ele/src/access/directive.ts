import type { App, Directive, DirectiveBinding } from 'vue';

import { checkDirectiveAccess } from '../../../../src/access/check-directive-access';
import { getAccessMode } from './get-access-mode';
import { getDirectiveAccessContext } from './get-directive-access-context';

function isAccessible(
  element: Element,
  binding: DirectiveBinding<string | string[]>,
) {
  const { accessCodes, userRoles } = getDirectiveAccessContext();

  const accessible = checkDirectiveAccess({
    accessCodes,
    accessMode: getAccessMode(),
    argument: binding.arg,
    requiredAccess: binding.value,
    userRoles,
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
