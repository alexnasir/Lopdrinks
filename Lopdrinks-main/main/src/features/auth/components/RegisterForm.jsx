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
      'w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4"
      aria-label="Registration form"
      noValidate
    >
      {errors.form && (
        <p role="alert" className="mb-4 text-red-500 text-sm">
          {errors.form}
        </p>
      )}

      {/* Username */}
      <div className="mb-4">
        <label htmlFor="register-username" className="block text-sm font-medium mb-1">
          Username
        </label>
        <input {...field('username', 'text', 'Username')} autoComplete="username" />
        {errors.username && (
          <p id="register-username-error" role="alert" className="mt-1 text-red-500 text-xs">
            {errors.username}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="mb-4">
        <label htmlFor="register-email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input {...field('email', 'email', 'you@example.com')} autoComplete="email" />
        {errors.email && (
          <p id="register-email-error" role="alert" className="mt-1 text-red-500 text-xs">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="mb-4">
        <label htmlFor="register-password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input {...field('password', 'password', 'At least 6 characters')} autoComplete="new-password" />
        {errors.password && (
          <p id="register-password-error" role="alert" className="mt-1 text-red-500 text-xs">
            {errors.password}
          </p>
        )}
      </div>

      {/* Role */}
      <div className="mb-4">
        <label htmlFor="register-role" className="block text-sm font-medium mb-1">
          Role
        </label>
        <select
          id="register-role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={ROLES.USER}>User</option>
          <option value={ROLES.ADMIN}>Admin</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Registering…' : 'Register'}
      </button>
    </form>
  );
};

export default RegisterForm;
