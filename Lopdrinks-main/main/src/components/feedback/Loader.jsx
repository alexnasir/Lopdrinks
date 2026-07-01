import React from 'react';

/**
 * Full-screen loading spinner.
 * Accessible: role="status" + aria-label gives screen readers context.
 */
const Loader = () => (
  <div
    className="flex min-h-screen items-center justify-center"
    role="status"
    aria-label="Loading"
  >
    <div className="relative w-32 h-32">
      <div
        className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-r-[#0ff] border-b-[#0ff] animate-spin"
        style={{ animationDuration: '3s' }}
        aria-hidden="true"
      />
      <div
        className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-t-[#0ff] animate-spin"
        style={{ animationDuration: '2s', animationDirection: 'reverse' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[#0ff] font-semibold animate-pulse">Loading…</span>
      </div>
    </div>
  </div>
);

export default Loader;
