function formatBearerToken(token: null | string): null | string {
  return token ? `Bearer ${token}` : null;
}

export { formatBearerToken };
