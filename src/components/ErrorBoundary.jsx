import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Log error details to console for debugging
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info)
    this.setState({ info })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding:40, color:'#E2E8F0', background:'#071028', minHeight:'100vh', fontFamily:'sans-serif' }}>
          <h2 style={{ color:'#FF6B6B' }}>Something went wrong</h2>
          <div style={{ marginTop:12 }}>
            <div style={{ fontWeight:700 }}>Error:</div>
            <pre style={{ whiteSpace:'pre-wrap', color:'#F8FAFC' }}>{String(this.state.error)}</pre>
            {this.state.info && (
              <details style={{ marginTop:12, color:'#94A3B8' }}>
                <summary>Stack trace</summary>
                <pre style={{ whiteSpace:'pre-wrap' }}>{this.state.info.componentStack}</pre>
              </details>
            )}
          </div>
          <div style={{ marginTop:20, color:'#94A3B8' }}>Check the browser console for more details.</div>
        </div>
      )
    }
    return this.props.children
  }
}
