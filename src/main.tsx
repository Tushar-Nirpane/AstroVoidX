// Global error handlers to capture load-time errors
window.addEventListener("error", (event) => {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; background: #fff; color: #000; font-family: monospace; border: 4px solid red; margin: 20px; borderRadius: 8px;">
        <h1 style="color: red; margin-top: 0;">Global JavaScript Error Caught</h1>
        <p style="color: red; font-weight: bold; font-size: 16px;">${event.message}</p>
        <pre style="background: #f4f4f4; padding: 15px; border-radius: 4px; overflow: auto; max-height: 400px;">${event.error?.stack || 'No stack trace available'}</pre>
        <p style="color: #666; font-size: 12px; margin-bottom: 0;">File: ${event.filename}:${event.lineno}:${event.colno}</p>
      </div>
    `;
  }
});

window.addEventListener("unhandledrejection", (event) => {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; background: #fff; color: #000; font-family: monospace; border: 4px solid orange; margin: 20px; borderRadius: 8px;">
        <h1 style="color: orange; margin-top: 0;">Unhandled Promise Rejection</h1>
        <p style="color: orange; font-weight: bold; font-size: 16px;">${event.reason}</p>
        <pre style="background: #f4f4f4; padding: 15px; border-radius: 4px; overflow: auto; max-height: 400px;">${event.reason?.stack || 'No stack trace available'}</pre>
      </div>
    `;
  }
});

import React, { Component, ErrorInfo, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", background: "#fff", color: "#000", fontFamily: "monospace", border: "4px solid red", margin: "20px", borderRadius: "8px" }}>
          <h1 style={{ color: "red", marginTop: 0 }}>Something went wrong (AstroVoidX Error Boundary)</h1>
          <p style={{ color: "red", fontWeight: "bold", fontSize: "16px" }}>
            {this.state.error && this.state.error.toString()}
          </p>
          <h3 style={{ marginBottom: "5px" }}>Stack Trace:</h3>
          <pre style={{ background: "#f4f4f4", padding: "15px", borderRadius: "4px", overflow: "auto", maxHeight: "300px" }}>
            {this.state.error?.stack}
          </pre>
          {this.state.errorInfo && (
            <>
              <h3 style={{ marginBottom: "5px", marginTop: "15px" }}>Component Stack:</h3>
              <pre style={{ background: "#f4f4f4", padding: "15px", borderRadius: "4px", overflow: "auto", maxHeight: "300px" }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
