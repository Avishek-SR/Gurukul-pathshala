// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  // Handle global auth events
  React.useEffect(() => {
    const handleLogout = () => {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    };

    const handleForbidden = (event) => {
      console.warn("Forbidden access detected:", event.detail);
      // Optional: Redirect to home/dashboard if stuck in wrong section
    };

    const handleStorageChange = (event) => {
      if (event.key === 'token' || event.key === 'user') {
        // If token/user changes in another tab, reload this tab to sync state
        window.location.reload();
      }
    };

    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:forbidden', handleForbidden);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:forbidden', handleForbidden);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;