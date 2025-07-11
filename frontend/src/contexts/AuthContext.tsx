// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchUserProfile, loginUser as apiLogin, validateToken } from '../api/auth';

interface User {
  _id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Function to fetch user data with token
  const fetchUserData = async (authToken: string): Promise<User | null> => {
    try {
      const userData = await fetchUserProfile(authToken);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
      return null;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Call login API
      const loginResponse = await apiLogin(email, password);
      const { token: authToken, user: userData } = loginResponse;

      // Store token in localStorage
      localStorage.setItem('token', authToken);
      setToken(authToken);

      let finalUserData: User;

      // If user data is included in login response, use it
      if (userData) {
        finalUserData = userData;
      } else {
        // Otherwise, fetch user data separately
        const fetchedUserData = await fetchUserData(authToken);
        if (!fetchedUserData) {
          throw new Error('Failed to fetch user data');
        }
        finalUserData = fetchedUserData;
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(finalUserData));
      setUser(finalUserData);
    } catch (error) {
      console.error('Login error:', error);
      // Clear any stored data on login failure
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken) {
          // Try to use saved user data first
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);
              setToken(savedToken);
              setUser(userData);
              
              // Validate token in background
              const isValid = await validateToken(savedToken);
              if (!isValid) {
                // Token is invalid, clear everything
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
              }
              return;
            } catch (parseError) {
              console.error('Error parsing saved user data:', parseError);
              localStorage.removeItem('user');
            }
          }
          
          // Fallback: validate token and fetch user data
          const isValid = await validateToken(savedToken);
          
          if (isValid) {
            setToken(savedToken);
            const userData = await fetchUserData(savedToken);
            
            if (userData) {
              localStorage.setItem('user', JSON.stringify(userData));
              setUser(userData);
            } else {
              // Token is invalid, clear it
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
            }
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};