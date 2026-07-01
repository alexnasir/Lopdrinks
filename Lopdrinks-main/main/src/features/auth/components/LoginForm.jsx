import React, { useState } from 'react';
import { loginSchema } from '../../../validation/loginSchema';

/**
 * Presentational login form.
 * Validates with Zod before calling onLogin.
 *
 * @param {{ onLogin: (data: { email: string, password: string }) => Promise<void> }} props
 */
const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach(({ path, message }) => {
        fieldErrors[path[0]] = message;
      });
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      await onLogin(result.data);
    } catch (err) {
      setErrors({ form: err.message || 'Login failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4"
      aria-label="Login form"
      noValidate
    >
      {errors.form && (
        <p role="alert" className="mb-4 text-red-500 text-sm">
          {errors.form}
        </p>
      )}

      <div className="mb-4">
        <label htmlFor="login-email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.email}
          onChange={handleChange}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p id="login-email-error" role="alert" className="mt-1 text-red-500 text-xs">
            {errors.email}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="login-password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.password}
          onChange={handleChange}
          aria-describedby={errors.password ? 'login-password-error' : undefined}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p id="login-password-error" role="alert" className="mt-1 text-red-500 text-xs">
            {errors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Logging in…' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;
