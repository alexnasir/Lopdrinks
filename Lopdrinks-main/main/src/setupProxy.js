/**
 * CRA dev-server proxy — compatible with http-proxy-middleware v3.
 *
 * In v3 the filter is a single function that receives the Express `req`
 * object.  We inspect req.path to decide whether to forward the request
 * to Flask or let the CRA dev server handle it (React Router pages).
 *
 * Forwarded to Flask backend:
 *   /login  /register  /verify  /health  /upload
 *   /recipes/<anything with slash or ending digit>
 *   /categories/...  /brew_methods/...  /ingredients/...
 *   /orders/...  /uploads/...
 *
 * NOT forwarded (handled by React Router):
 *   /recipes        — the Recipes listing page
 *   /about  /admin/categories  etc.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

const API_TARGET = 'https://lopdrinks-api.onrender.com';

// Exact paths that always go to Flask
const EXACT = new Set(['/login', '/register', '/verify', '/health', '/upload']);

// Path prefixes that always go to Flask (note trailing slash)
const PREFIXES = [
  '/recipes/',
  '/categories/',
  '/brew_methods/',
  '/ingredients/',
  '/orders/',
  '/uploads/',
];

module.exports = function (app) {
  app.use(
    // v3 filter: single argument is the req object
    function filter(req) {
      const p = typeof req.path === 'string' ? req.path : String(req.url || '');
      if (EXACT.has(p)) return true;
      return PREFIXES.some(function (prefix) { return p.indexOf(prefix) === 0; });
    },
    createProxyMiddleware({
      target: API_TARGET,
      changeOrigin: true,
      on: {
        proxyReq: function (_proxyReq, req) {
          console.log('[proxy] ' + req.method + ' ' + req.path + ' → ' + API_TARGET);
        },
        error: function (err, _req, res) {
          console.error('[proxy] error:', err.message);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
        },
      },
    })
  );
};
