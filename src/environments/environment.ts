export const environment = {
  production: true,
  apiUrl: import.meta.env['VITE_API_URL'] || 'api',
  hubUrl: import.meta.env['VITE_HUB_URL'] || 'hub',
  authStorageKey: 'auth',
  debounceMilliseconds: 3000,
  defaultUserImageUrl: '/assets/user.png',
};
