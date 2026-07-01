/**
 * CRA dev-server proxy configuration.
 * Auto-loaded by react-scripts — no import needed anywhere else.
 *
 * All API paths are forwarded to the real backend so the browser
 * never makes a cross-origin request during development.
 *
 * The `changeOrigin: true` option rewrites the Host header to match
 * the target, which is required for Render's HTTPS hosting.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

const API_TARGET = 'https://lopdrinks-api.onrender.com';

// All paths that should be forwarded to the backend
const API_PATHS = [
  '/login',
  '/register',
  '/verify',
  '/recipes',
  '/brew_methods',
  '/ingredients',
  '/orders',
  '/upload',
];

module.exports = function (app) {
  app.use(
    API_PATHS,
    createProxyMiddleware({
      target: API_TARGET,
      changeOrigin: true,
      secure: true,
      // Log proxy activity in dev for easier debugging
      on: {
        proxyReq: (proxyReq, req) => {
          console.log(`[proxy] ${req.method} ${req.url} → ${API_TARGET}${req.url}`);
        },
        error: (err, req, res) => {
          console.error('[proxy] error:', err.message);
          res.status(502).json({ error: 'Proxy error', message: err.message });
        },
      },
    })
  );
};
