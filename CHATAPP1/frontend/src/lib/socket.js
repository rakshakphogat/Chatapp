import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.connectionPromise = null;
        this.connectionCallbacks = [];
    }

    connect(userId) {
        // If already connecting, return the existing promise
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        // If already connected with same user, return resolved promise
        if (this.socket?.connected && this.currentUserId === userId) {
            console.log('Socket already connected for user:', userId);
            return Promise.resolve();
        }

        // Disconnect existing socket if connecting with different user
        if (this.socket) {
            this.disconnect();
        }

        if (!userId || userId === 'undefined') {
            console.error('Cannot connect socket: Invalid user ID', userId);
            return Promise.reject(new Error('Invalid user ID'));
        }

        this.currentUserId = userId;

        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                console.log('🔌 Connecting socket for user:', userId);

                const serverUrl = import.meta.env.VITE_SOCKET_URL || 
                    import.meta.env.VITE_API_URL?.replace('/api', '') || 
                    'http://localhost:5001';
                console.log('🌐 Connecting to server:', serverUrl);

                this.socket = io(serverUrl, {
                    query: {
                        userId: userId,
                    },
                    withCredentials: true,
                    autoConnect: true,
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                });

                this.socket.on('connect', () => {
                    console.log('✅ Socket connected:', this.socket.id, 'for user:', userId);
                    this.isConnected = true;
                    this.connectionPromise = null;

                    // Call all waiting callbacks
                    this.connectionCallbacks.forEach(callback => callback());
                    this.connectionCallbacks = [];

                    resolve();
                });

                this.socket.on('disconnect', () => {
                    console.log('❌ Socket disconnected');
                    this.isConnected = false;
                });

                this.socket.on('connect_error', (error) => {
                    console.error('❌ Socket connection error:', error);
                    this.isConnected = false;
                    this.connectionPromise = null;
                    reject(error);
                });

                // Set a timeout for connection
                setTimeout(() => {
                    if (!this.isConnected) {
                        console.error('❌ Socket connection timeout');
                        this.connectionPromise = null;
                        reject(new Error('Connection timeout'));
                    }
                }, 10000); // 10 second timeout

            } catch (error) {
                console.error('Failed to connect to socket:', error);
                this.connectionPromise = null;
                reject(error);
            }
        });

        return this.connectionPromise;
    }

    disconnect() {
        if (this.socket) {
            console.log('🔌 Disconnecting socket');
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.currentUserId = null;
            this.connectionPromise = null;
            this.connectionCallbacks = [];
        }
    }

    // Method to execute callback when socket is ready
    onConnected(callback) {
        if (this.isConnected && this.socket?.connected) {
            callback();
        } else {
            this.connectionCallbacks.push(callback);
        }
    }

    getSocket() {
        return this.socket;
    }

    isSocketConnected() {
        return this.isConnected && this.socket?.connected;
    }
}

const socketService = new SocketService();
export default socketService;