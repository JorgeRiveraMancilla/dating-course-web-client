export const environment = {
  production: true,
  apiUrl: process.env['VITE_API_URL'] || 'api',
  hubUrl: process.env['VITE_HUB_URL'] || 'hub',
  authStorageKey: 'auth',
  debounceMilliseconds: 0,
  defaultUserImageUrl: '/assets/user.png',
};
