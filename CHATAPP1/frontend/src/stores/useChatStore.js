import { create } from 'zustand';
import api from '../lib/api.js';
import socketService from '../lib/socket.js';
import toast from 'react-hot-toast';

const useChatStore = create((set, get) => ({
  // State
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Get all users
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await api.get('/messages/users');

      if (response.data.success) {
        set({ users: response.data.users });
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Get users error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Get messages with selected user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await api.get(`/messages/${userId}`);

      if (response.data.success) {
        set({ messages: response.data.messages });
      } else {
        toast.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Get messages error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch messages');
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send message
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();

    if (!selectedUser) {
      toast.error('No user selected');
      return;
    }

    try {
      const response = await api.post(`/messages/send/${selectedUser._id}`, messageData);

      if (response.data.success) {
        set({ messages: [...messages, response.data.message] });
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  },

  // Set selected user and fetch messages
  setSelectedUser: async (selectedUser) => {
    set({ selectedUser });

    if (selectedUser) {
      await get().getMessages(selectedUser._id);
    } else {
      set({ messages: [] });
    }
  },

  // Socket event handlers
  setupSocketListeners: () => {
    const socket = socketService.socket;

    if (!socket) return;

    // Listen for new messages
    socket.on('newMessage', (message) => {
      const { messages, selectedUser } = get();

      // Only add message if it's from the currently selected user
      if (selectedUser && (
        message.senderId === selectedUser._id ||
        message.receiverId === selectedUser._id
      )) {
        set({ messages: [...messages, message] });
      }
    });

    // Listen for user status updates
    socket.on('getOnlineUsers', (onlineUsers) => {
      const { users } = get();

      // Update users with online status
      const updatedUsers = users.map(user => ({
        ...user,
        isOnline: onlineUsers.includes(user._id)
      }));

      set({ users: updatedUsers });
    });
  },

  // Clean up socket listeners
  cleanupSocketListeners: () => {
    const socket = socketService.socket;

    if (!socket) return;

    socket.off('newMessage');
    socket.off('getOnlineUsers');
  },

  // Subscribe to real-time updates
  subscribeToMessages: () => {
    const { setupSocketListeners } = get();
    setupSocketListeners();
  },

  // Unsubscribe from real-time updates
  unsubscribeFromMessages: () => {
    const { cleanupSocketListeners } = get();
    cleanupSocketListeners();
  },

  // Clear chat data (for logout)
  clearChatData: () => {
    set({
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
    });
  },
}));

export default useChatStore;