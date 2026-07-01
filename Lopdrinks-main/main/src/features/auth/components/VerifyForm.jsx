import React, { useState } from 'react';
import { verifySchema } from '../../../validation/verifySchema';

/**
 * OTP verification form.
 * @param {{ onVerify: (data: { email: string, otp: string }) => Promise<void>, otp?: string }} props
 */
const VerifyForm = ({ onVerify, otp }) => {
  const [formData, setFormData] = useState({ email: '', otp: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = verifySchema.safeParse(formData);
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
      await onVerify(result.data);
    } catch (err) {
      setErrors({ form: err.message || 'Verification failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Dev convenience — shows the OTP returned by the server */}
      {otp && (
        <p className="mb-4 text-blue-500 font-semibold" aria-live="polite">
          Your OTP: <span className="font-mono">{otp}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} aria-label="Verify OTP form" noValidate>
        {errors.form && (
          <p role="alert" className="mb-4 text-red-500 text-sm">
            {errors.form}
          </p>
        )}

        <div className="mb-4">
          <label htmlFor="verify-email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="verify-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'verify-email-error' : undefined}
          />
          {errors.email && (
            <p id="verify-email-error" role="alert" className="mt-1 text-red-500 text-xs">
              {errors.email}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="verify-otp" className="block text-sm font-medium mb-1">
            OTP Code
          </label>
          <input
            id="verify-otp"
            type="text"
            name="otp"
            autoComplete="one-time-code"
            placeholder="OTP code"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.otp}
            onChange={handleChange}
            aria-invalid={!!errors.otp}
            aria-describedby={errors.otp ? 'verify-otp-error' : undefined}
          />
          {errors.otp && (
            <p id="verify-otp-error" role="alert" className="mt-1 text-red-500 text-xs">
              {errors.otp}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Verifying…' : 'Verify'}
        </button>
      </form>
    </div>
  );
};

export default VerifyForm;
