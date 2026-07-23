interface DirectiveAccessOptions {
  accessCodes: string[];
  accessMode: string;
  argument?: string;
  requiredAccess?: string | string[];
  userRoles: string[];
}

function checkDirectiveAccess({
  accessCodes,
  accessMode,
  argument,
  requiredAccess,
  userRoles,
}: DirectiveAccessOptions): boolean {
  if (!requiredAccess) {
    return true;
  }

  const requiredValues = Array.isArray(requiredAccess)
    ? requiredAccess
    : [requiredAccess];
  const grantedValues =
    accessMode === 'frontend' && argument === 'role'
      ? userRoles
      : accessCodes;
  const grantedValueSet = new Set(grantedValues);

  return requiredValues.some((value) => grantedValueSet.has(value));
}

export { checkDirectiveAccess };
