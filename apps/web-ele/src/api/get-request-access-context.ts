import { useAccessStore } from '@vben/stores';

function getRequestAccessContext() {
  const accessStore = useAccessStore();

  return {
    accessToken: accessStore.accessToken,
    isAccessChecked: accessStore.isAccessChecked,
    setAccessToken: (token: null | string) => accessStore.setAccessToken(token),
    setLoginExpired: (loginExpired: boolean) =>
      accessStore.setLoginExpired(loginExpired),
  };
}

export { getRequestAccessContext };
