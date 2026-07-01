/**
 * Central application configuration.
 * All env-variable reads happen here, nowhere else in the app.
 */
const appConfig = {
  apiBaseUrl: process.env.REACT_APP_API_URL || 'https://lopdrinks-api.onrender.com',
  appName: 'LopCafe',
};

export default appConfig;
