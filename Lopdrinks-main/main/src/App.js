import React, { useState, useEffect, useCallback, useRef, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ThemeProvider, { useTheme } from './components/ThemeContext';
import Api from './components/api';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error.Please try refreshing the page:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          <h1 className="text-xl font-bold">Something went wrong.</h1>
          <p>Error: {this.state.error?.message}</p>
          <p>Please try refreshing the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const RegisterForm = lazy(() => import('./components/RegisterForm'));
const VerifyForm = lazy(() => import('./components/VerifyForm'));
const RecipeForm = lazy(() => import('./components/RecipeForm'));
const OrderList = lazy(() => import('./components/OrderList'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const Header = lazy(() => import('./components/Header'));
const LoginForm = lazy(() => import('./components/LoginForm'));
const Contact = lazy(() => import('./components/contact'));
const AboutUs = lazy(() => import('./components/about'));
const Recipes = lazy(() => import('./components/Recipes'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const BrewMethods = lazy(() => import('./components/BrewMethods'));
const Ingredients = lazy(() => import('./components/Ingredients'));

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const backend = Api();
  const role = localStorage.getItem('role') || 'User'; 
  const [isRedirecting, setIsRedirecting] = useState(false);

  console.log('ProtectedRoute:', { token: backend.token, role, adminOnly, path: window.location.pathname });

  if (isRedirecting) return null;
  if (!backend.token) {
    console.log('No token, redirecting to /login');
    setIsRedirecting(true);
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && role !== 'Admin') {
    console.log(`Admin route access denied, role: ${role}, redirecting to /user-dashboard`);
    setIsRedirecting(true);
    return <Navigate to="/user-dashboard" replace />;
  }
  return children;
};

const AppContent = () => {
  const backend = Api();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  const location = useLocation();
  const [recipes, setRecipes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [brewMethods, setBrewMethods] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [role, setRole] = useState(localStorage.getItem('role') || 'User');
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [otp, setOtp] = useState(null);
  const [isRecipesLoading, setIsRecipesLoading] = useState(false);
  const [isProtectedLoading, setIsProtectedLoading] = useState(false);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    console.log('Current token:', backend.token);
  }, [backend.token]);

  const safeNavigate = useCallback((...args) => {
    console.log('Navigating to:', args[0]);
    navigateRef.current(...args);
  }, []);

  useEffect(() => {
    if (!['/recipes', '/orders'].includes(location.pathname)) return;

    let isMounted = true;
    const loadRecipes = async () => {
      setIsRecipesLoading(true);
      try {
        const recipesData = await backend.fetchRecipes();
        if (isMounted) {
          setRecipes(recipesData || []);
        }
      } catch (err) {
        console.error('Failed to load recipes:', err.message);
      } finally {
        if (isMounted) {
          setIsRecipesLoading(false);
        }
      }
    };

    loadRecipes();
    return () => {
      isMounted = false;
    };
  }, [backend, location.pathname]);

  useEffect(() => {
    if (!backend.token || !['/orders', '/create-recipe'].includes(location.pathname)) return;

    let isMounted = true;
    const loadProtectedData = async () => {
      setIsProtectedLoading(true);
      try {
        const [brewMethodsData, ingredientsData, ordersData] = await Promise.all([
          backend.fetchBrewMethods(),
          backend.fetchIngredients(),
          backend.fetchOrders(),
        ]);
        if (isMounted) {
          setBrewMethods(brewMethodsData || []);
          setIngredients(ingredientsData || []);
          setOrders(ordersData || []);
        }
      } catch (err) {
        console.error('Failed to load protected data:', err.message);
      } finally {
        if (isMounted) {
          setIsProtectedLoading(false);
        }
      }
    };

    loadProtectedData();
    return () => {
      isMounted = false;
    };
  }, [backend, backend.token, location.pathname]);

  const handleLogin = useCallback(async (data) => {
    try {
      console.log('handleLogin called with:', data);
      const result = await backend.login(data);
      const userRole = result.role || localStorage.getItem('role') || 'User';
      localStorage.setItem('role', userRole); 
      setRole(userRole);
      console.log('Login successful, role:', userRole, 'navigating to:', userRole === 'Admin' ? '/admin-dashboard' : '/user-dashboard');
      safeNavigate(userRole === 'Admin' ? '/admin-dashboard' : '/user-dashboard');
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  }, [backend, safeNavigate]);

  const handleRegister = useCallback(async (data) => {
    try {
      const result = await backend.register(data);
      console.log('Registration successful, OTP:', result.otp);
      setIsRegistered(true);
      setOtp(result.otp);
      safeNavigate('/verify');
    } catch (error) {
      console.error('Register error:', error.message);
      throw error;
    }
  }, [backend, safeNavigate]);

  const handleVerify = useCallback(async (data) => {
    try {
      await backend.verify(data);
      setIsRegistered(false);
      setOtp(null);
      safeNavigate('/login');
    } catch (error) {
      console.error('Verify error:', error.message);
      throw error;
    }
  }, [backend, safeNavigate]);

  const handleOrder = useCallback(async (recipeId, quantity = 1) => {
    if (!backend.token) {
      console.error('No token found, redirecting to login');
      safeNavigate('/login');
      throw new Error('Please log in to place an order');
    }
    try {
      console.log('handleOrder: Placing order for recipe ID:', recipeId, 'Quantity:', quantity);
      await backend.placeOrder(recipeId, quantity);
      console.log('handleOrder: Fetching updated orders list');
      const ordersData = await backend.fetchOrders();
      setOrders(ordersData || []);
      safeNavigate('/orders');
    } catch (error) {
      console.error('handleOrder error:', error.message);
      throw error;
    }
  }, [backend, safeNavigate]);

  const handleUpdateOrder = useCallback(async (orderId, data) => {
    if (!backend.token) {
      console.error('No token found, redirecting to login');
      safeNavigate('/login');
      throw new Error('Please log in to update an order');
    }
    try {
      console.log('handleUpdateOrder: Updating order ID:', orderId, 'with data:', data);
      await backend.updateOrder(orderId, data);
      console.log('handleUpdateOrder: Fetching updated orders list');
      const ordersData = await backend.fetchOrders();
      setOrders(ordersData || []);
    } catch (error) {
      console.error('handleUpdateOrder error:', error.message);
      throw error;
    }
  }, [backend, safeNavigate]);

  const handleDeleteOrder = useCallback(async (orderId) => {
    if (!backend.token) {
      console.error('No token found, redirecting to login');
      safeNavigate('/login');
      throw new Error('Please log in to delete an order');
    }
    try {
      console.log('handleDeleteOrder: Deleting order ID:', orderId);
      await backend.deleteOrder(orderId);
      console.log('handleDeleteOrder: Fetching updated orders list');
      const ordersData = await backend.fetchOrders();
      setOrders(ordersData || []);
    } catch (error) {
      console.error('handleDeleteOrder error:', error.message);
      throw error;
    }
  }, [backend, safeNavigate]);

  const handleRecipeSubmit = useCallback(async (formData) => {
    try {
      if (editingRecipe) {
        await backend.updateRecipe(editingRecipe.id, formData);
      } else {
        await backend.createRecipe(formData);
      }
      const recipesData = await backend.fetchRecipes();
      setRecipes(recipesData || []);
      setEditingRecipe(null);
      safeNavigate('/recipes');
    } catch (error) {
      console.error('Recipe submit error:', error.message);
      throw error;
    }
  }, [backend, editingRecipe, safeNavigate]);

  const handleEditRecipe = useCallback((recipe) => {
    if (!backend.token || role !== 'Admin') {
      safeNavigate('/login');
      throw new Error('Please log in as an admin to edit recipes.');
    }
    setEditingRecipe(recipe);
    safeNavigate('/create-recipe');
  }, [backend.token, role, safeNavigate]);

  const handleDeleteRecipe = useCallback(async (recipeId) => {
    if (!backend.token || role !== 'Admin') {
      safeNavigate('/login');
      throw new Error('Please log in as an admin to delete recipes.');
    }
    try {
      await backend.deleteRecipe(recipeId);
      const recipesData = await backend.fetchRecipes();
      setRecipes(recipesData || []);
    } catch (error) {
      console.error('Delete recipe error:', error.message);
      throw error;
    }
  }, [backend, role, safeNavigate]);

  const VerifyRoute = ({ children }) => (
    isRegistered ? children : <Navigate to="/signup" replace />
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <ErrorBoundary>
        <Header
          isLoggedIn={!!backend.token}
          onLogout={() => {
            backend.logout();
            setRole(null);
            setOrders([]);
            safeNavigate('/');
          }}
        />
      </ErrorBoundary>
      <div className="pt-16">
        {(isRecipesLoading || isProtectedLoading)}
        <ErrorBoundary>
          <Routes>
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<AboutUs />} />
            <Route
              path="/"
              element={<LandingPage onGetStarted={() => safeNavigate('/signup')} />}
            />
            <Route
              path="/signup"
              element={
                !backend.token ? (
                  <div className="p-4">
                    <RegisterForm onRegister={handleRegister} />
                  </div>
                ) : (
                  <Navigate to={role === 'Admin' ? '/admin-dashboard' : '/user-dashboard'} replace />
                )
              }
            />
            <Route
              path="/verify"
              element={
                !backend.token ? (
                  <VerifyRoute>
                    <div className="p-4">
                      <VerifyForm onVerify={handleVerify} otp={otp} />
                    </div>
                  </VerifyRoute>
                ) : (
                  <Navigate to={role === 'Admin' ? '/admin-dashboard' : '/user-dashboard'} replace />
                )
              }
            />
            <Route
              path="/login"
              element={
                !backend.token ? (
                  <div className="p-4">
                    <LoginForm onLogin={handleLogin} />
                  </div>
                ) : (
                  <Navigate to={role === 'Admin' ? '/admin-dashboard' : '/user-dashboard'} replace />
                )
              }
            />
            <Route
              path="/recipes"
              element={
                <div className="p-4">
                  <Recipes
                    recipes={recipes}
                    onOrder={handleOrder}
                    isAdmin={role === 'Admin'}
                    onEdit={handleEditRecipe}
                    onDelete={handleDeleteRecipe}
                  />
                </div>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Orders</h1>
                    <OrderList
                      orders={orders}
                      onUpdate={handleUpdateOrder}
                      onDelete={handleDeleteOrder}
                      isAdmin={role === 'Admin'}
                    />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-recipe"
              element={
                <ProtectedRoute adminOnly>
                  <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">
                      {editingRecipe ? 'Edit Recipe' : 'Create Recipe'}
                    </h1>
                    <RecipeForm
                      onSubmit={handleRecipeSubmit}
                      initialData={editingRecipe || {}}
                      brewMethods={brewMethods}
                      ingredients={ingredients}
                    />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/brew-methods"
              element={
                <ProtectedRoute adminOnly>
                  <BrewMethods />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ingredients"
              element={
                <ProtectedRoute adminOnly>
                  <Ingredients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<div className="p-4 font-bold text-blue-900">404 LopCafe Does not Support</div>} />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <Router>
      <AppContent />
    </Router>
  </ThemeProvider>
);

export default App;