import { create } from 'zustand';
import api from '../lib/api.js';
import socketService from '../lib/socket.js';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  // State
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  // Auth Check
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/check');

      if (response.data.success) {
        set({ authUser: response.data.user });
        get().connectSocket();
      } else {
        set({ authUser: null });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Signup
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const response = await api.post('/auth/signup', data);

      if (response.data.success) {
        set({ authUser: response.data.user });
        toast.success('Account created successfully');
        get().connectSocket();
      } else {
        toast.error(response.data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Login
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const response = await api.post('/auth/login', data);

      if (response.data.success) {
        set({ authUser: response.data.user });
        toast.success('Logged in successfully');
        get().connectSocket();
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ authUser: null });
      toast.success('Logged out successfully');
      get().disconnectSocket();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  },

  // Update Profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const response = await api.put('/auth/update-profile', data);

      if (response.data.success) {
        set({ authUser: response.data.user });
        toast.success('Profile updated successfully');
      } else {
        toast.error(response.data.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Profile update failed');
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Socket Connection
  connectSocket: () => {
    const { authUser } = get();
    if (authUser && !socketService.socket?.connected) {
      socketService.connect(authUser._id);
    }
  },

  disconnectSocket: () => {
    if (socketService.socket?.connected) {
      socketService.disconnect();
    }
  },
}));

export default useAuthStore;