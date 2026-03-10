import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  // Normal Login (Fallback)
  login: async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Login Failed', error);
      return false;
    }
  },

  register: async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Registration Failed', error);
      return false;
    }
  },

  // Google OAuth Login
  loginWithGoogle: async (credential) => {
    try {
      const { data } = await api.post('/auth/google', { token: credential });
      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Google Login Error', error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

export default useAuthStore;
