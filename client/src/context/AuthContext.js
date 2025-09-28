import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Set auth token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  };

  // Load user data
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setCurrentUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Error loading user', err);
      setCurrentUser(null);
      setError('Failed to load user data');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (email, password) => {
    try {
      setError('');
      const res = await axios.post('/api/auth/register', { email, password });
      const { token, user } = res.data;
      
      setAuthToken(token);
      setCurrentUser(user);
      await loadUser();
      return user;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Registration failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError('');
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      
      setAuthToken(token);
      setCurrentUser(user);
      await loadUser();
      return user;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Login failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Logout user
  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Load user on initial render
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    loadUser,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
