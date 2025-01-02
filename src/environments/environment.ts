export const environment = {
  production: true,
  apiUrl: process.env['NG_API_URL'] || 'api',
  hubUrl: process.env['NG_HUB_URL'] || 'hub',
  authStorageKey: 'auth',
  debounceMilliseconds: 3000,
  defaultUserImageUrl: '/assets/user.png',
};
