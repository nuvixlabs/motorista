import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const HARDCODED_CREDENTIALS = {
  username: 'NOVAROTA',
  password: 'NOVAROTA25'
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing auth
    const storedAuth = localStorage.getItem('novarota_auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setIsAuthenticated(true);
        setCurrentUser(authData.user);
      } catch (error) {
        console.error('Error parsing auth data:', error);
        localStorage.removeItem('novarota_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    if (
      username === HARDCODED_CREDENTIALS.username &&
      password === HARDCODED_CREDENTIALS.password
    ) {
      const userData = {
        username: HARDCODED_CREDENTIALS.username,
        loginTime: new Date().toISOString()
      };
      
      setIsAuthenticated(true);
      setCurrentUser(userData);
      
      localStorage.setItem('novarota_auth', JSON.stringify({
        user: userData,
        timestamp: Date.now()
      }));
      
      return { success: true };
    }
    
    return { success: false, error: 'Credenciais inválidas' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('novarota_auth');
  };

  const value = {
    isAuthenticated,
    currentUser,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};