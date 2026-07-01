import React, { useState } from 'react';

const VerifyForm = ({ onVerify, otp }) => {
  const [formData, setFormData] = useState({ email: '', otp: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('VerifyForm submitting:', formData);
    onVerify(formData);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {otp && (
        <p className="mb-4 text-blue-500 font-semibold">
          Your OTP: {otp}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="OTP Code"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.otp}
            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Verify
        </button>
      </form>
    </div>
  );
};

export default VerifyForm;