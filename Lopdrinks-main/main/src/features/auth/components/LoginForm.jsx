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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8"
        aria-label="Login form"
        noValidate
      >
        <div className="mb-7 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue to your account</p>
        </div>

        {errors.form && (
          <p
            role="alert"
            className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100"
          >
            {errors.form}
          </p>
        )}

        <div className="mb-5">
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white"
            value={formData.email}
            onChange={handleChange}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p id="login-email-error" role="alert" className="mt-1.5 text-xs text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white"
            value={formData.password}
            onChange={handleChange}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p id="login-password-error" role="alert" className="mt-1.5 text-xs text-red-500">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting && (
            <svg
              className="animate-spin h-4 w-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <a
            href="register"
            className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-2"
          >
            Register
          </a>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;