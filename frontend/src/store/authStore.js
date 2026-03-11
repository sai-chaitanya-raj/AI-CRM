import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  // Normal Login (Fallback to 2FA if required)
  login: async (email, password, twoFactorCode = '') => {
    try {
      const { data } = await api.post('/auth/login', { email, password, twoFactorCode });
      
      if (data.requires2FA) {
        return { success: true, requires2FA: true };
      }

      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token, isAuthenticated: true });
      return { success: true, requires2FA: false };
    } catch (error) {
      console.error('Login Failed', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  },

  register: async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      console.error('Registration Failed', error);
      return { success: false, error: 'Registration failed. Email might be in use.' };
    }
  },

  // Google OAuth Login
  loginWithGoogle: async (credential) => {
    try {
      const { data } = await api.post('/auth/google', { token: credential });
      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      console.error('Google Login Error', error);
      return { success: false, error: 'Google Authentication failed.' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

export default useAuthStore;
