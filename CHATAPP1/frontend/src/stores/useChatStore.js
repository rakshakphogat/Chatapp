import { create } from 'zustand';
import api from '../lib/api.js';
import socketService from '../lib/socket.js';
import toast from 'react-hot-toast';

const useChatStore = create((set, get) => ({
  // State
  messages: [],
  users: [],
  selectedUser: null,
  onlineUsers: [],
  unreadMessages: {}, // {userId: count}
  isUsersLoading: false,
  isMessagesLoading: false,
  isSocketListenersSetup: false,

  // Get all users
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await api.get('/messages/users');

      if (response.data.success) {
        set({ users: response.data.users });
        console.log('👥 Fetched users:', response.data.users.length);
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
        console.log('💬 Fetched messages:', response.data.messages.length);
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
        console.log('📤 Message sent successfully');
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

      // Clear unread count for this user
      const { unreadMessages } = get();
      const updatedUnreadMessages = { ...unreadMessages };
      delete updatedUnreadMessages[selectedUser._id];
      console.log(`Clearing unread count for ${selectedUser.fullName} (${selectedUser._id})`);
      console.log('Before clear:', unreadMessages);
      console.log('After clear:', updatedUnreadMessages);
      set({ unreadMessages: updatedUnreadMessages });
    } else {
      set({ messages: [] });
    }
  },

  // Socket event handlers - setup only once when socket is ready
  setupSocketListeners: () => {
    const { isSocketListenersSetup } = get();

    if (isSocketListenersSetup) {
      console.log('🎧 Socket listeners already set up, skipping');
      return;
    }

    const socket = socketService.getSocket();

    if (!socket || !socketService.isSocketConnected()) {
      console.log('⚠️ Socket not ready for listeners setup');
      return;
    }

    console.log('🎧 Setting up socket listeners');

    // Clean up any existing listeners first
    socket.removeAllListeners('newMessage');
    socket.removeAllListeners('getOnlineUsers');

    // Listen for new messages
    socket.on('newMessage', (message) => {
      console.log('📨 New message received:', message);
      const { messages, selectedUser, unreadMessages } = get();

      // Check if this message is for the currently selected conversation
      const isCurrentConversation = selectedUser && (
        message.senderId === selectedUser._id ||
        message.receiverId === selectedUser._id
      );

      if (isCurrentConversation) {
        console.log('✅ Adding message to current conversation');
        set({ messages: [...messages, message] });
      } else {
        console.log('ℹ️ Message not for current conversation');

        // Increment unread count for the sender if not current conversation
        const { unreadMessages } = get();
        const updatedUnreadMessages = { ...unreadMessages };
        updatedUnreadMessages[message.senderId] = (updatedUnreadMessages[message.senderId] || 0) + 1;
        set({ unreadMessages: updatedUnreadMessages });
        console.log('📬 Updated unread count for user:', message.senderId, 'Count:', updatedUnreadMessages[message.senderId]);
        console.log('📬 Full unread state:', updatedUnreadMessages);
      }
    });

    // Listen for user status updates
    socket.on('getOnlineUsers', (onlineUserIds) => {
      console.log('👥 Received online users:', onlineUserIds);

      // Remove duplicates and ensure it's an array
      const uniqueOnlineUsers = [...new Set(onlineUserIds)];

      set({ onlineUsers: uniqueOnlineUsers });
      console.log('📱 Updated online users state:', uniqueOnlineUsers);
    });

    set({ isSocketListenersSetup: true });
    console.log('✅ Socket listeners setup complete');
  },

  // Clean up socket listeners
  cleanupSocketListeners: () => {
    const socket = socketService.getSocket();

    if (!socket) {
      console.log('⚠️ No socket to clean up');
      return;
    }

    console.log('🧹 Cleaning up socket listeners');
    socket.removeAllListeners('newMessage');
    socket.removeAllListeners('getOnlineUsers');

    set({ isSocketListenersSetup: false });
  },

  // Subscribe to real-time updates - improved with proper socket connection waiting
  subscribeToMessages: () => {
    console.log('🔔 Subscribing to messages...');

    // Use the new socket service's connection callback system
    socketService.onConnected(() => {
      console.log('🔔 Socket ready, setting up listeners');
      const { setupSocketListeners } = get();
      setupSocketListeners();
    });
  },

  // Unsubscribe from real-time updates
  unsubscribeFromMessages: () => {
    console.log('🔕 Unsubscribing from messages');
    const { cleanupSocketListeners } = get();
    cleanupSocketListeners();
  },

  // Get users with online status - computed property
  getUsersWithOnlineStatus: () => {
    const { users, onlineUsers } = get();

    return users.map(user => ({
      ...user,
      isOnline: onlineUsers.includes(user._id)
    }));
  },

  // Get online users count
  getOnlineUsersCount: () => {
    const { onlineUsers } = get();
    return onlineUsers.length;
  },

  // Check if selected user is online
  isSelectedUserOnline: () => {
    const { selectedUser, onlineUsers } = get();
    return selectedUser ? onlineUsers.includes(selectedUser._id) : false;
  },

  // Get unread count for a specific user
  getUnreadCount: (userId) => {
    const { unreadMessages } = get();
    const count = unreadMessages[userId] || 0;
    return count;
  },

  // Get total unread count
  getTotalUnreadCount: () => {
    const { unreadMessages } = get();
    return Object.values(unreadMessages).reduce((total, count) => total + count, 0);
  },

  // Test method to set unread count manually (for debugging)
  setUnreadCountForTesting: (userId, count) => {
    const { unreadMessages } = get();
    const updatedUnreadMessages = { ...unreadMessages };
    updatedUnreadMessages[userId] = count;
    set({ unreadMessages: updatedUnreadMessages });
    console.log(`✅ Test: Set unread count for ${userId} to ${count}`);
    console.log('✅ Test: Updated unread state:', updatedUnreadMessages);
  },

  // Clear chat data (for logout)
  clearChatData: () => {
    console.log('🧽 Clearing chat data');
    const { cleanupSocketListeners } = get();
    cleanupSocketListeners();

    set({
      messages: [],
      users: [],
      selectedUser: null,
      onlineUsers: [],
      unreadMessages: {},
      isUsersLoading: false,
      isMessagesLoading: false,
      isSocketListenersSetup: false,
    });
  },
}));

export default useChatStore;