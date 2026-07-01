# LopCafe Frontend — Architecture Guide

## Overview

React 19 · React Router 6 · Tailwind CSS 3 · Axios · Zod · react-hot-toast

The frontend follows a **feature-first** architecture.
Business domains own their own code; shared infrastructure lives in clearly named top-level directories.

---

## Folder Structure

```
src/
├── app/                    # Application bootstrap
│   ├── App.jsx             # Root shell (Header + ErrorBoundary + routes)
│   ├── index.jsx           # ReactDOM.createRoot entry point
│   ├── providers.jsx       # All context providers composed in one place
│   └── routes.jsx          # Centralised routing (lazy, protected, role-based)
│
├── api/                    # HTTP layer
│   ├── axios.js            # Configured axios instance (base URL)
│   ├── interceptors.js     # JWT injection + normalised error shape
│   ├── endpoints.js        # All API path strings in one place
│   └── index.js            # Barrel re-export
│
├── services/               # Domain service functions (no fetch/axios in components)
│   ├── auth.service.js
│   ├── recipe.service.js
│   ├── order.service.js
│   ├── brew.service.js
│   ├── ingredient.service.js
│   ├── upload.service.js
│   └── index.js            # Named barrel exports
│
├── features/               # Feature modules — each owns its own code
│   ├── auth/
│   │   ├── components/     LoginForm, RegisterForm, VerifyForm
│   │   └── index.js
│   ├── recipes/
│   │   ├── components/     RecipeCard, RecipeForm
│   │   └── index.js
│   ├── orders/
│   │   ├── components/     OrderList
│   │   └── index.js
│   ├── dashboard/
│   │   ├── components/     AdminDashboard, UserDashboard
│   │   └── index.js
│   ├── ingredients/
│   │   ├── components/     Ingredients
│   │   └── index.js
│   └── brewing/
│       ├── components/     BrewMethods
│       └── index.js
│
├── pages/                  # Route-level page components (thin composers)
│   ├── HomePage.jsx
│   ├── AboutPage.jsx
│   ├── ContactPage.jsx
│   ├── RecipesPage.jsx
│   ├── OrdersPage.jsx
│   ├── CreateRecipePage.jsx
│   ├── NotFoundPage.jsx
│   └── index.js
│
├── components/             # Truly shared components only
│   ├── layout/
│   │   └── Header.jsx      # Fixed navigation bar
│   ├── feedback/
│   │   ├── Loader.jsx      # Spinner used as Suspense fallback
│   │   └── ErrorBoundary.jsx
│   └── common/
│       └── ProtectedRoute.jsx
│
├── context/                # React Context providers
│   ├── AuthContext.jsx     # token, role, persistAuth, clearAuth
│   ├── ThemeContext.jsx    # isDarkMode, toggleTheme
│   └── index.js
│
├── hooks/                  # Custom reusable hooks
│   ├── useApi.js           # Generic async wrapper (loading/error)
│   ├── useAuth.js          # Re-exports useAuth from context
│   ├── useTheme.js         # Re-exports useTheme from context
│   ├── useRecipes.js       # Recipe list state + CRUD
│   ├── useOrders.js        # Order list state + CRUD
│   ├── useDebounce.js      # Debounces a value
│   └── index.js
│
├── services/               # (see above)
│
├── constants/              # Application-wide string constants
│   ├── roles.js            # ROLES.ADMIN / ROLES.USER
│   ├── orderStatus.js      # ORDER_STATUS + ORDER_STATUS_OPTIONS
│   ├── routes.js           # ROUTES.* path strings
│   └── index.js
│
├── config/
│   └── app.config.js       # All env-variable reads happen here
│
├── validation/             # Zod schemas — one per form
│   ├── loginSchema.js
│   ├── registerSchema.js
│   ├── recipeSchema.js
│   ├── verifySchema.js
│   └── index.js
│
├── utils/
│   ├── formatters.js       # formatCurrency, formatDate, capitalise
│   ├── storage.js          # Type-safe localStorage wrappers
│   └── index.js
│
└── styles/
    ├── variables.css       # CSS custom properties (design tokens)
    └── animations.css      # Global keyframes
```

---

## Architectural Decisions

### 1 — Feature-first layout
Each business domain (`auth`, `recipes`, `orders`, `dashboard`, `ingredients`, `brewing`) owns its components, and exposes them through a barrel `index.js`. Pages import from features, not the other way around.

### 2 — API / Service separation
- `api/` contains only the transport layer (axios instance, interceptors, endpoints).
- `services/` contains domain functions that call the API. No `fetch`/`axios` ever appears inside a component or hook.
- This means swapping the HTTP client only touches `api/` and nothing else.

### 3 — Centralised routing (`app/routes.jsx`)
All `<Route>` definitions, auth callbacks, and lazy imports live in one file. Adding a route never means searching across the codebase.

- Lazy loading via `React.lazy()` + `<Suspense>` is applied to **every** route component.
- `ProtectedRoute` guards auth-only and admin-only routes.
- Auth callbacks (login/register/verify) live in `routes.jsx` because they need `useNavigate` and touch `AuthContext`.

### 4 — AuthContext replaces token state scattered across App.js
`AuthContext` owns `{ token, role, isLoggedIn, isAdmin, persistAuth, clearAuth }`. Components call `useAuth()` — they never read `localStorage` directly.

### 5 — Providers composition (`app/providers.jsx`)
All root providers (BrowserRouter → AuthProvider → ThemeProvider → Toaster) are composed in one file. `App.jsx` stays lean.

### 6 — Zod validation at form boundaries
Schemas live in `validation/`. Form components call `schema.safeParse()` before invoking any service. Errors are mapped to per-field messages, never raw API responses.

### 7 — Toast replaces `alert()` / `window.confirm()`
`react-hot-toast` replaces every `alert()` success/error message. `window.confirm()` is retained only for destructive confirmation dialogs (delete) — replacing it with a modal component is a future enhancement.

### 8 — Memoisation policy
- Page components: standard (no memo needed — route renders once).
- Feature list items rendered in loops (`RecipeCard`): `React.memo`.
- Callbacks passed to child components: `useCallback`.
- Computed values: `useMemo` only when the computation is non-trivial.

### 9 — Accessibility improvements
Every interactive element has:
- `aria-label` or visible `<label>` associated via `htmlFor`/`id`
- `aria-invalid` + `aria-describedby` on form fields with errors
- `role="alert"` on error messages; `aria-live="polite"` on status feedback
- `focus:outline-none focus:ring-2` focus rings on all buttons and links

### 10 — Constants over magic strings
`ROUTES`, `ROLES`, `ORDER_STATUS` constants replace every magic string in the app. A typo in a route now causes a compile-time reference error, not a silent 404.

---

## Data Flow

```
User interaction
   → Page component (thin composer)
   → Custom hook (useRecipes / useOrders / useAuth)
   → Service function (recipeService.create)
   → API client (axios + interceptors)
   → Backend API
   ← Normalised response / error
   → State update → re-render
   → Toast notification (react-hot-toast)
```

---

## Adding a New Feature

1. Create `src/features/<domain>/components/MyComponent.jsx`
2. Add a service function to `src/services/<domain>.service.js`
3. Export from `src/features/<domain>/index.js`
4. Create a page in `src/pages/MyPage.jsx` that composes the feature component
5. Add the route to `src/app/routes.jsx`
6. Add the path constant to `src/constants/routes.js`

No other files need to change.

---

## Development

```bash
npm start          # Development server (CRA)
npm run build      # Production build
npm test           # Jest + React Testing Library
```

### Environment variables
Copy `.env.example` and create `.env.local`:
```
REACT_APP_API_URL=https://lopdrinks.onrender.com
```
All env reads go through `src/config/app.config.js` — never `process.env.*` directly in components.
