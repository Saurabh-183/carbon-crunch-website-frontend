import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', background: '#fef2f2', color: '#991b1b', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
          <div style={{ maxWidth: '800px', width: '100%', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Application Error</h2>
            <p style={{ marginBottom: '16px' }}>The dashboard encountered a runtime error. Please take a screenshot of this page and send it to the developer.</p>
            <div style={{ background: '#f87171', color: 'white', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontWeight: 'bold' }}>
              {this.state.error && this.state.error.toString()}
            </div>
            <details open style={{ whiteSpace: 'pre-wrap', background: '#f1f5f9', color: '#334155', padding: '12px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>Stack Trace</summary>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
