import { useAccessStore, useUserStore } from '@vben/stores';

function getDirectiveAccessContext() {
  const accessStore = useAccessStore();
  const userStore = useUserStore();

  return {
    accessCodes: accessStore.accessCodes,
    userRoles: userStore.userRoles,
  };
}

export { getDirectiveAccessContext };
