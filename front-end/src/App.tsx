// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import axios from "axios";
import { useState, useEffect, createContext, useContext } from "react"; // Import createContext and useContext

const queryClient = new QueryClient();

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
axios.defaults.withCredentials = true;

// Create a context for authentication
interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  loadingAuth: boolean; // Add loading state to context
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/tokenIsValid`);
        setIsAuthenticated(res.data);
      } catch (error) {
        console.error("Token validation failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoadingAuth(false);
      }
    };
    checkAuth();
  }, []); // Run only once on mount

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, loadingAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loadingAuth } = useAuth(); // Use auth from context

  if (loadingAuth) {
    return <div>Loading authentication...</div>; // Show loading indicator while checking auth
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          {" "}
          {/* Wrap routes with AuthProvider */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
