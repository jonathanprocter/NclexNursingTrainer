function useErrorBoundary.d() {
  return null;
}

export type UseErrorBoundaryApi<TError> = {
    resetBoundary: () => void;
    showBoundary: (error: TError) => void;
};
export declare function useErrorBoundary<TError = any>(): UseErrorBoundaryApi<TError>;


export default useErrorBoundary.d;
