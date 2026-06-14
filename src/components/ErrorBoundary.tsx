import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    // Attempt to clear potentially corrupt local state and reload
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full border-t-8 border-red-500">
            <h1 className="text-4xl mb-4">🙈</h1>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Ôi không, có lỗi xảy ra!</h2>
            <p className="text-slate-500 mb-6 font-medium leading-relaxed">
              Ứng dụng vừa gặp một sự cố nhỏ ngoài ý muốn. Đừng lo lắng, hãy bấm nút bên dưới để quay lại màn hình chính nhé!
            </p>
            <button
              onClick={this.handleReset}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-lg py-4 rounded-2xl shadow-md transition-transform active:scale-95"
            >
              🏠 Về Màn Hình Chính
            </button>
            {this.state.error && (
              <div className="mt-6 p-4 bg-slate-100 rounded-xl text-left overflow-hidden">
                <p className="text-xs font-mono text-slate-400 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
