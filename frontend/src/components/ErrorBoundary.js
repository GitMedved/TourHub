import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md text-center">
            <div className="text-5xl mb-4">🧭</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Что-то пошло не так</h1>
            <p className="text-gray-500 mb-6">Обновите страницу или вернитесь на главную.</p>
            <button
              onClick={() => window.location.assign('/')}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition"
            >
              На главную
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
