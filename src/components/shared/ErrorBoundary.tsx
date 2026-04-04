import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-lg w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">!</span>
            </div>
            <h1 className="text-lg font-medium text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-500 mb-4">
              The application encountered an unexpected error. Your filing data is safe in local storage.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 overflow-auto max-h-32 text-red-700">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
