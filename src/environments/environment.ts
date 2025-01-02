declare const window: Window & {
  __env: { [key: string]: string };
};

export const environment = {
  production: true,
  apiUrl: window.__env?.['API_URL'] || 'api',
  hubUrl: window.__env?.['HUB_URL'] || 'hub',
  authStorageKey: 'auth',
  debounceMilliseconds: 3000,
  defaultUserImageUrl: '/assets/user.png',
};
