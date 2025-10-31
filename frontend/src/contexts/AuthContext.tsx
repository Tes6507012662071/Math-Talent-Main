import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchUserProfile, loginUser as apiLogin, validateToken } from '../api/auth';

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
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

  const fetchUserData = async (authToken: string): Promise<User | null> => {
    try {
      const userData = await fetchUserProfile(authToken);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    console.log("[AuthContext] Login attempt:", email);
    try {
      setLoading(true);
      
      const loginResponse = await apiLogin(email, password);
      console.log("[AuthContext] Login API response:", loginResponse);

      const { token: authToken, user: userData } = loginResponse;

      localStorage.setItem('token', authToken);
      setToken(authToken);
      console.log("[AuthContext] Token stored:", authToken);

      let finalUserData: User;

      if (userData) {
        console.log("[AuthContext] Using user data from login response:", userData);
        finalUserData = userData;
      } else {
        console.log("[AuthContext] Fetching user data with token...");
        const fetchedUserData = await fetchUserData(authToken);
        console.log("[AuthContext] Fetched user data:", fetchedUserData);

        if (!fetchedUserData) {
          throw new Error('Failed to fetch user data');
        }
        finalUserData = fetchedUserData;
      }

      localStorage.setItem('user', JSON.stringify(finalUserData));
      setUser(finalUserData);
      console.log("[AuthContext] User set in context:", finalUserData);

    } catch (error) {
      console.error("[AuthContext] Login error:", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
      console.log("[AuthContext] Login process finished");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("[AuthContext] Initializing authentication state...");
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        console.log("[AuthContext] Found saved token:", savedToken ? "YES" : "NO");
        console.log("[AuthContext] Found saved user:", savedUser ? "YES" : "NO");

        if (savedToken) {
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);
              console.log("[AuthContext] Parsed saved user data:", userData);
              setToken(savedToken);
              setUser(userData);
              
              console.log("[AuthContext] Validating token...");
              const isValid = await validateToken(savedToken);
              console.log("[AuthContext] Token valid:", isValid);

              if (!isValid) {
                console.warn("[AuthContext] Token invalid. Clearing storage.");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
              }
              return;
            } catch (parseError) {
              console.error("[AuthContext] Error parsing saved user data:", parseError);
              localStorage.removeItem('user');
            }
          }
          
          console.log("[AuthContext] Validating token before fetching user data...");
          const isValid = await validateToken(savedToken);
          console.log("[AuthContext] Token valid:", isValid);
          
          if (isValid) {
            setToken(savedToken);
            const userData = await fetchUserData(savedToken);
            console.log("[AuthContext] User data fetched:", userData);
            
            if (userData) {
              localStorage.setItem('user', JSON.stringify(userData));
              setUser(userData);
            } else {
              console.warn("[AuthContext] Failed to fetch user data. Clearing storage.");
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
            }
          } else {
            console.warn("[AuthContext] Invalid token on init. Clearing storage.");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
          }
        }
      } catch (error) {
        console.error("[AuthContext] Error initializing auth:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
        console.log("[AuthContext] Initialization complete");
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