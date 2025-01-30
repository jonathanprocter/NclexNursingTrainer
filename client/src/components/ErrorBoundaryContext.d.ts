function ErrorBoundaryContext.d() {
  return null;
}

export type ErrorBoundaryContextType = {
    didCatch: boolean;
    error: any;
    resetErrorBoundary: (...args: any[]) => void;
};
export declare const ErrorBoundaryContext: import("react").Context<ErrorBoundaryContextType | null>;


export default ErrorBoundaryContext.d;
