import React from 'react';

/**
 * Catches React render errors and shows a friendly fallback.
 * Wrap any subtree that could throw during rendering.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="p-6 m-4 rounded-lg bg-red-50 border border-red-200 text-red-800"
        >
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-sm mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
