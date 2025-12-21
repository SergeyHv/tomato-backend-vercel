import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("UI ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12 text-center">
          <div className="text-rose-600 font-semibold mb-2">Что-то пошло не так</div>
          <div className="text-gray-500">Попробуйте обновить страницу или снять фильтры.</div>
        </div>
      );
    }
    return this.props.children;
  }
}
