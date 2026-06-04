import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/dataService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('smartseat_token');
    const savedUser = localStorage.getItem('smartseat_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('smartseat_token');
        localStorage.removeItem('smartseat_refresh_token');
        localStorage.removeItem('smartseat_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { user: userData, token, refreshToken } = res.data.data;
    localStorage.setItem('smartseat_token', token);
    localStorage.setItem('smartseat_refresh_token', refreshToken);
    localStorage.setItem('smartseat_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    const { user: userData, token, refreshToken } = res.data.data;
    localStorage.setItem('smartseat_token', token);
    localStorage.setItem('smartseat_refresh_token', refreshToken);
    localStorage.setItem('smartseat_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    const rToken = localStorage.getItem('smartseat_refresh_token');
    if (rToken) {
      try {
        await authService.logout({ refreshToken: rToken });
      } catch (err) {
        console.error('Logout request failed:', err);
      }
    }
    localStorage.removeItem('smartseat_token');
    localStorage.removeItem('smartseat_refresh_token');
    localStorage.removeItem('smartseat_user');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem('smartseat_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isOwner: user?.role === 'restaurant_owner' || user?.role === 'admin',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
