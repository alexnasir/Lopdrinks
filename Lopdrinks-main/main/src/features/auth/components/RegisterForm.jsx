import React, { useState } from 'react';
import { registerSchema } from '../../../validation/registerSchema';
import { ROLES } from '../../../constants/roles';

/**
 * Presentational registration form.
 * @param {{ onRegister: (data: object) => Promise<void> }} props
 */
const RegisterForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: ROLES.USER,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = registerSchema.safeParse(formData);
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
      await onRegister(result.data);
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (name, type = 'text', placeholder = '') => ({
    id: `register-${name}`,
    name,
    type,
    placeholder,
    value: formData[name],
    onChange: handleChange,
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `register-${name}-error` : undefined,
    className:
      'w-full px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white',
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8"
        aria-label="Registration form"
        noValidate
      >
        <div className="mb-7 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Sign up to get started</p>
        </div>

        {errors.form && (
          <p
            role="alert"
            className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100"
          >
            {errors.form}
          </p>
        )}

        {/* Username */}
        <div className="mb-5">
          <label htmlFor="register-username" className="block text-sm font-medium text-slate-700 mb-1.5">
            Username
          </label>
          <input {...field('username', 'text', 'Username')} autoComplete="username" />
          {errors.username && (
            <p id="register-username-error" role="alert" className="mt-1.5 text-xs text-red-500">
              {errors.username}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mb-5">
          <label htmlFor="register-email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email
          </label>
          <input {...field('email', 'email', 'you@example.com')} autoComplete="email" />
          {errors.email && (
            <p id="register-email-error" role="alert" className="mt-1.5 text-xs text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-5">
          <label htmlFor="register-password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <input {...field('password', 'password', 'At least 6 characters')} autoComplete="new-password" />
          {errors.password && (
            <p id="register-password-error" role="alert" className="mt-1.5 text-xs text-red-500">
              {errors.password}
            </p>
          )}
        </div>

        {/* Role */}
        <div className="mb-6">
          <label htmlFor="register-role" className="block text-sm font-medium text-slate-700 mb-1.5">
            Role
          </label>
          <select
            id="register-role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white"
          >
            <option value={ROLES.USER}>User</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>
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
          {isSubmitting ? 'Registering…' : 'Register'}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <a
            href="login"
            className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-2"
          >
            Login
          </a>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;