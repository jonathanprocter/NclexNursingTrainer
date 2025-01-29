import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './ErrorBoundary'; // Assuming ErrorBoundary component exists

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please try again.</div>}>
      <Router>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-100">
            <h1>NCLEX Prep</h1>
            {/*  Rest of the application routes and components would go here */}
          </div>
        </QueryClientProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;