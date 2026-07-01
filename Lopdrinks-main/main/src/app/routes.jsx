import React, { lazy, Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import { ProtectedRoute } from '../components/common';
import { Loader } from '../components/feedback';
import { ROUTES, ROLES } from '../constants';
import toast from 'react-hot-toast';

// ─── Lazy-loaded pages ──────────────────────────────────────────────────────
const HomePage         = lazy(() => import('../pages/HomePage'));
const AboutPage        = lazy(() => import('../pages/AboutPage'));
const ContactPage      = lazy(() => import('../pages/ContactPage'));
const RecipesPage      = lazy(() => import('../pages/RecipesPage'));
const RecipeDetailPage = lazy(() => import('../pages/RecipeDetailPage'));
const OrdersPage       = lazy(() => import('../pages/OrdersPage'));
const CreateRecipePage = lazy(() => import('../pages/CreateRecipePage'));
const NotFoundPage     = lazy(() => import('../pages/NotFoundPage'));

// Auth feature components (lazy)
const LoginForm    = lazy(() => import('../features/auth/components/LoginForm'));
const RegisterForm = lazy(() => import('../features/auth/components/RegisterForm'));
const VerifyForm   = lazy(() => import('../features/auth/components/VerifyForm'));

// Dashboards
const AdminDashboard = lazy(() => import('../features/dashboard/components/AdminDashboard'));
const UserDashboard  = lazy(() => import('../features/dashboard/components/UserDashboard'));

// Admin-only feature pages
const BrewMethods             = lazy(() => import('../features/brewing/components/BrewMethods'));
const Ingredients             = lazy(() => import('../features/ingredients/components/Ingredients'));
const AdminCategoriesPage     = lazy(() => import('../pages/AdminCategoriesPage'));
const AdminRecipeCategoryPage = lazy(() => import('../pages/AdminRecipeCategoryPage'));

// ─── Exported hook for App.jsx ───────────────────────────────────────────────
/**
 * Returns a stable logout callback. Used by App.jsx to pass to Header.
 * Lives here so it shares the same Router context.
 */
export const useLogout = () => {
  const { clearAuth } = useAuth();
  const navigate = useNavigate();
  return useCallback(() => {
    clearAuth();
    navigate(ROUTES.HOME);
    toast.success('Logged out');
  }, [clearAuth, navigate]);
};

// ─── Central routes ──────────────────────────────────────────────────────────
/**
 * All application routes in one file.
 * - Auth callbacks (login / register / verify) live here
 * - Recipe edit state that spans routes lives here
 * - Route guards use ProtectedRoute
 */
const AppRoutes = () => {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  const { isLoggedIn, role, persistAuth } = useAuth();

  const [isRegistered, setIsRegistered] = useState(false);
  const [otp, setOtp]                   = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);

  // ── Auth handlers ──────────────────────────────────────────────────────
  const handleLogin = useCallback(async (data) => {
    const result = await authService.login(data);
    const userRole = result.role || ROLES.USER;
    persistAuth(result.token, userRole);
    const destination =
      userRole === ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.USER_DASHBOARD;
    toast.success(userRole === ROLES.ADMIN ? 'Welcome back, Admin!' : 'Welcome back!');
    // Use setTimeout to let AuthContext state flush before navigating,
    // so ProtectedRoute reads the updated role on first render.
    setTimeout(() => navigateRef.current(destination, { replace: true }), 0);
  }, [persistAuth]);

  const handleRegister = useCallback(async (data) => {
    const result = await authService.register(data);
    setIsRegistered(true);
    setOtp(result?.otp ?? null);
    toast.success('Registered! Check your email for the OTP.');
    navigateRef.current(ROUTES.VERIFY);
  }, []);

  const handleVerify = useCallback(async (data) => {
    await authService.verify(data);
    setIsRegistered(false);
    setOtp(null);
    toast.success('Email verified! Please log in.');
    navigateRef.current(ROUTES.LOGIN);
  }, []);

  // ── Recipe edit helpers ────────────────────────────────────────────────
  const handleClearEdit = useCallback(() => setEditingRecipe(null), []);

  // ── Helpers ────────────────────────────────────────────────────────────
  const dashboardRoute =
    role === ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.USER_DASHBOARD;

  /** Guards the verify route — requires a prior successful registration. */
  const VerifyGuard = ({ children }) =>
    isRegistered ? children : <Navigate to={ROUTES.SIGNUP} replace />;

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────── */}
        <Route path={ROUTES.HOME}    element={<HomePage />} />
        <Route path={ROUTES.ABOUT}   element={<AboutPage />} />
        <Route path={ROUTES.CONTACT} element={<ContactPage />} />
        <Route path={ROUTES.RECIPES} element={<RecipesPage />} />
        <Route path={ROUTES.RECIPE_DETAIL} element={<RecipeDetailPage />} />

        {/* ── Auth (redirect if already logged in) ────────────────────── */}
        <Route
          path={ROUTES.SIGNUP}
          element={
            !isLoggedIn
              ? <div className="p-4"><RegisterForm onRegister={handleRegister} /></div>
              : <Navigate to={dashboardRoute} replace />
          }
        />
        <Route
          path={ROUTES.VERIFY}
          element={
            !isLoggedIn
              ? (
                <VerifyGuard>
                  <div className="p-4">
                    <VerifyForm onVerify={handleVerify} otp={otp} />
                  </div>
                </VerifyGuard>
              )
              : <Navigate to={dashboardRoute} replace />
          }
        />
        <Route
          path={ROUTES.LOGIN}
          element={
            !isLoggedIn
              ? <div className="p-4"><LoginForm onLogin={handleLogin} /></div>
              : <Navigate to={dashboardRoute} replace />
          }
        />

        {/* ── Protected (any authenticated user) ──────────────────────── */}
        <Route
          path={ROUTES.ORDERS}
          element={<ProtectedRoute><OrdersPage /></ProtectedRoute>}
        />
        <Route
          path={ROUTES.USER_DASHBOARD}
          element={<ProtectedRoute><UserDashboard /></ProtectedRoute>}
        />

        {/* ── Admin-only ───────────────────────────────────────────────── */}
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path={ROUTES.CREATE_RECIPE}
          element={
            <ProtectedRoute adminOnly>
              <CreateRecipePage
                editingRecipe={editingRecipe}
                onClearEdit={handleClearEdit}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.BREW_METHODS}
          element={<ProtectedRoute adminOnly><BrewMethods /></ProtectedRoute>}
        />
        <Route
          path={ROUTES.INGREDIENTS}
          element={<ProtectedRoute adminOnly><Ingredients /></ProtectedRoute>}
        />
        <Route
          path={ROUTES.ADMIN_CATEGORIES}
          element={<ProtectedRoute adminOnly><AdminCategoriesPage /></ProtectedRoute>}
        />
        <Route
          path={ROUTES.ADMIN_RECIPE_CATEGORY}
          element={<ProtectedRoute adminOnly><AdminRecipeCategoryPage /></ProtectedRoute>}
        />

        {/* ── 404 ─────────────────────────────────────────────────────── */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
