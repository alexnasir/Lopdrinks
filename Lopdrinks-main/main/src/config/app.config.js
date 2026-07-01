/**
 * Central application configuration.
 * All env-variable reads happen here — never use process.env.* directly
 * in components or services.
 *
 * In development:  apiBaseUrl is "" (empty) — CRA proxy handles routing.
 * In production:   apiBaseUrl is the full Render URL.
 */
const appConfig = {
  apiBaseUrl: process.env.REACT_APP_API_URL || '',
  appName: 'LopCafe',
};

export default appConfig;
