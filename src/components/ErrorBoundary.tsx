import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends (Component as any) {
  state: State = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Onverwachte React fout opgevangen door ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="font-serif min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5 text-amber-500 text-2xl font-bold">
              !
            </div>
            <h2 className="text-2xl font-bold text-ob-blue mb-3">Er ging iets mis</h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              De pagina kon niet volledig worden geladen. Als u zojuist een bestelling heeft geplaatst, is deze waarschijnlijk al veilig ontvangen in ons systeem.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => window.location.href = "/"}
                className="w-full bg-[#5170ff] text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-[#4060ee] transition-colors shadow-sm text-sm"
              >
                Terug naar startpagina
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
              >
                Pagina vernieuwen
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
