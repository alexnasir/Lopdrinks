import { useState, useEffect, useCallback } from 'react';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Api = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const apiFetch = useCallback(async (url, options = {}) => {
    const headers = {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    console.log('apiFetch: Request:', { url: `${BASE_URL}${url}`, method: options.method || 'GET', headers, body: options.body });

    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers,
        credentials: 'include',
      });
      console.log('apiFetch: Response:', { status: response.status, ok: response.ok, headers: Object.fromEntries(response.headers.entries()) });

      let data;
      try {
        data = response.status !== 204 ? await response.json() : null;
      } catch (e) {
        data = { error: true, message: 'Failed to parse response', code: response.status };
      }

      if (!response.ok) {
        const error = new Error(data?.message || `HTTP error ${response.status}`);
        error.response = response;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API error for ${url}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.data,
      });
      throw error;
    }
  }, [token]);

  const login = async (data) => {
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }
    try {
      const result = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });
      setToken(result.token);
      localStorage.setItem('token', result.token);
      localStorage.setItem('role', result.role || 'User');
      console.log('Login response:', { token: result.token.substring(0, 10) + '...', role: result.role });
      return result;
    } catch (error) {
      console.error('Login error:', error.message, error.data);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    console.log('Logged out');
  };

  const register = async (data) => {
    if (!data.username || !data.email || !data.password) {
      throw new Error('Username, email, and password are required');
    }
    try {
      return await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          role: data.role || 'User',
        }),
      });
    } catch (error) {
      console.error('Register error:', error.message, error.data);
      throw error;
    }
  };

  const verify = async (data) => {
    if (!data.email || !data.otp) {
      throw new Error('Email and OTP are required');
    }
    try {
      return await apiFetch('/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          otp: data.otp,
        }),
      });
    } catch (error) {
      console.error('Verify error:', error.message, error.data);
      throw error;
    }
  };

  const fetchRecipes = async () => {
    try {
      const startTime = Date.now();
      const data = await apiFetch('/recipes/');
      console.log('fetchRecipes: Data length:', data?.length, 'Time:', Date.now() - startTime, 'ms');
      return data;
    } catch (error) {
      console.error('Fetch recipes error:', error.message, error.data);
      throw error;
    }
  };

  const fetchBrewMethods = async () => {
    try {
      const data = await apiFetch('/brew_methods/');
      return data;
    } catch (error) {
      console.error('Fetch brew methods error:', error.message, error.data);
      throw error;
    }
  };

  const createBrewMethod = async (data) => {
    if (!data.name) {
      throw new Error('Name is required');
    }
    try {
      return await apiFetch('/brew_methods/', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          details: data.details,
        }),
      });
    } catch (error) {
      console.error('Create brew method error:', error.message, error.data);
      throw error;
    }
  };

  const fetchIngredients = async () => {
    try {
      const data = await apiFetch('/ingredients/');
      return data;
    } catch (error) {
      console.error('Fetch ingredients error:', error.message, error.data);
      throw error;
    }
  };

  const createIngredient = async (data) => {
    if (!data.name) {
      throw new Error('Name is required');
    }
    try {
      return await apiFetch('/ingredients/', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
        }),
      });
    } catch (error) {
      console.error('Create ingredient error:', error.message, error.data);
      throw error;
    }
  };

  const fetchOrders = async () => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }
      console.log('fetchOrders: Initiating request with token:', token.substring(0, 10) + '...');
      const data = await apiFetch('/orders/');
      console.log('fetchOrders: Retrieved', data?.length, 'orders');
      return data || [];
    } catch (error) {
      console.error('fetchOrders error:', {
        message: error.message,
        status: error.response?.status,
        data: error.data,
      });
      throw error;
    }
  };

  const fetchRecentOrders = async (limit = 5) => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }
      if (limit < 1) {
        throw new Error('Limit must be a positive integer');
      }
      console.log('fetchRecentOrders: Requesting', limit, 'recent orders');
      const data = await apiFetch(`/orders/?limit=${limit}`);
      console.log('fetchRecentOrders: Retrieved', data?.length, 'orders');
      return data || [];
    } catch (error) {
      console.error('fetchRecentOrders error:', {
        message: error.message,
        status: error.response?.status,
        data: error.data,
      });
      throw error;
    }
  };
  const fetchPendingOrders = async (limit = 5) => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }
      if (limit < 1) {
        throw new Error('Limit must be a positive integer');
      }
      console.log('fetchPendingOrders: Requesting', limit, 'pending orders');
      const data = await apiFetch(`/orders/?limit=${limit}&status=Pending`);
      console.log('fetchPendingOrders: Retrieved', data?.length, 'orders');
      return data || [];
    } catch (error) {
      console.error('fetchPendingOrders error:', {
        message: error.message,
        status: error.response?.status,
        data: error.data,
      });
      throw error;
    }
  };

  const fetchOrderById = async (orderId) => {
    try {
      if (!orderId || isNaN(orderId)) {
        throw new Error('Valid order ID required');
      }
      console.log('fetchOrderById: Fetching order ID:', orderId);
      const data = await apiFetch(`/orders/${orderId}`);
      console.log('fetchOrderById: Retrieved order:', data);
      return data;
    } catch (error) {
      console.error('fetchOrderById error:', {
        message: error.message,
        status: error.response?.status,
        data: error.data,
      });
      throw error;
    }
  };

  const placeOrder = async (recipeId, quantity = 1) => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }
      if (!recipeId || isNaN(recipeId)) {
        throw new Error('Valid recipe ID required');
      }
      if (quantity < 1 || isNaN(quantity)) {
        throw new Error('Quantity must be a positive integer');
      }
      const payload = { recipe_id: Number(recipeId), quantity: Number(quantity) };
      console.log('placeOrder: Submitting order with payload:', payload);
      const response = await apiFetch('/orders/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log('placeOrder: Order created successfully, ID:', response.order_id);
      return response;
    } catch (error) {
      console.error('placeOrder error:', {
        message: error.message,
        status: error.response?.status,
        data: error.data,
      });
      throw error;
    }
  };

  const updateOrder = async (orderId, data) => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }
      if (!orderId || isNaN(orderId)) {
        throw new Error('Valid order ID required');
      }
      if (!data || (!data.quantity && !data.status)) {
        throw new Error('Quantity or status required for update');
      }
      const payload = {};
      if (data.quantity) payload.quantity = Number(data.quantity);
      if (data.status) payload.status = data.status;
      console.log('updateOrder: Updating order ID:', orderId, 'with payload:', payload);
      const response = await apiFetch(`/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      console.log('updateOrder: Order updated successfully');
      return response;
    } catch (error) {
      console.error('updateOrder error:', {
        message: error.message,
        status: error.response?.status,
        data: error.data,
      });
      throw error;
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }
      if (!orderId || isNaN(orderId)) {
        throw new Error('Valid order ID required');
      }
      console.log('deleteOrder: Deleting order ID:', orderId);
      const response = await apiFetch(`/orders/${orderId}`, {
        method: 'DELETE',
      });
      console.log('deleteOrder: Order deleted successfully');
      return response;
    } catch (error) {
      console.error('deleteOrder error:', {
        message: error.message,
        status: error.response?.status,
        data: error.data,
      });
      throw error;
    }
  };

  const createRecipe = async (data) => {
    try {
      return await apiFetch('/recipes/', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          price: data.price,
          takeaway: data.takeaway,
          brew_method_id: data.brew_method_id,
          ingredients: data.ingredients,
          image_url: data.image_url,
        }),
      });
    } catch (error) {
      console.error('Create recipe error:', error.message, error.data);
      throw error;
    }
  };

  const updateRecipe = async (recipeId, data) => {
    try {
      return await apiFetch(`/recipes/${recipeId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          price: data.price,
          takeaway: data.takeaway,
          brew_method_id: data.brew_method_id,
          ingredients: data.ingredients,
          image_url: data.image_url,
        }),
      });
    } catch (error) {
      console.error('Update recipe error:', error.message, error.data);
      throw error;
    }
  };

  const deleteRecipe = async (recipeId) => {
    try {
      return await apiFetch(`/recipes/${recipeId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete recipe error:', error.message, error.data);
      throw error;
    }
  };

  const uploadImage = async (file) => {
    try {
      if (!token) {
        throw new Error('No token available');
      }
      const formData = new FormData();
      formData.append('file', file);
      console.log('uploadImage: Token:', token.substring(0, 10) + '...');
      const response = await apiFetch('/upload', {
        method: 'POST',
        body: formData,
      });
      console.log('uploadImage: Response:', response);
      return response;
    } catch (error) {
      console.error('Upload image error:', {
        message: error.message,
        status: error.response?.status,
        data: error.data,
      });
      throw error;
    }
  };

  return {
    token,
    login,
    logout,
    register,
    verify,
    fetchRecipes,
    fetchBrewMethods,
    createBrewMethod,
    fetchIngredients,
    createIngredient,
    fetchOrders,
    fetchPendingOrders,
    fetchRecentOrders,
    fetchOrderById,
    placeOrder,
    updateOrder,
    deleteOrder,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    uploadImage,
  };
};

export default Api;