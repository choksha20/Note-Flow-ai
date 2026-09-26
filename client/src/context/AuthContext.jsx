import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('noteflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('noteflow_token'));
  const [loading, setLoading] = useState(true);

  // Check auth session on boot
  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('noteflow_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Session verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: userToken } = res.data;
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('noteflow_token', userToken);
    localStorage.setItem('noteflow_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (email, password, name) => {
    const res = await api.post('/auth/register', { email, password, name });
    const { user: userData, token: userToken } = res.data;
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('noteflow_token', userToken);
    localStorage.setItem('noteflow_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('noteflow_token');
    localStorage.removeItem('noteflow_user');
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    setUser(res.data.user);
    localStorage.setItem('noteflow_user', JSON.stringify(res.data.user));
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
