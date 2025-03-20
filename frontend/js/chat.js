/**
 * WebSocket Chat Client
 * Handles WebSocket connection and message processing
 */
class ChatClient {
    constructor() {
        this.stompClient = null;
        this.username = '';
        this.currentRoom = 'general';
        this.connected = false;
        this.onMessageReceived = null;
        this.onPrivateMessageReceived = null;
        this.onUserJoined = null;
        this.onUserLeft = null;
        this.onRoomsReceived = null;
        this.onUsersReceived = null;
        this.onHistoryReceived = null;
        this.onConnected = null;
        this.onError = null;
    }

    /**
     * Connect to the WebSocket server
     * @param {string} username - The user's username
     */
    connect(username) {
        this.username = username;
        
        // Create SockJS and Stomp client
        // Use relative URL to automatically adapt to current location
        const socket = new SockJS('/ws');
        this.stompClient = Stomp.over(socket);
        
        // Enable debug logs for troubleshooting
        this.stompClient.debug = console.log;
        
        // Connect to the server with additional reconnect options
        const headers = {};
        const connectCallback = this._onConnected.bind(this);
        const errorCallback = this._onError.bind(this);
        
        // Try to connect with auto-reconnect
        this.stompClient.connect(headers, connectCallback, errorCallback);
    }

    /**
     * Disconnect from the WebSocket server
     */
    disconnect() {
        if (this.stompClient) {
            this.stompClient.disconnect();
            this.connected = false;
        }
    }

    /**
     * Send a chat message to the current room
     * @param {string} content - The message content
     */
    sendMessage(content) {
        if (!this.connected) return;
        
        const chatMessage = {
            sender: this.username,
            content: content,
            type: 'CHAT',
            roomId: this.currentRoom
        };
        
        this.stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
    }

    /**
     * Send a private message to a specific user
     * @param {string} recipient - The recipient's username
     * @param {string} content - The message content
     */
    sendPrivateMessage(recipient, content) {
        if (!this.connected) return;
        
        const chatMessage = {
            sender: this.username,
            content: content,
            recipient: recipient,
            type: 'PRIVATE'
        };
        
        this.stompClient.send("/app/chat.private", {}, JSON.stringify(chatMessage));
    }

    /**
     * Join a chat room
     * @param {string} roomId - The room ID to join
     */
    joinRoom(roomId) {
        if (!this.connected) return;
        
        // Leave current room
        if (this.currentRoom) {
            this.stompClient.send(`/app/chat.leave/${this.currentRoom}`, {}, {});
            this.stompClient.unsubscribe(`room-${this.currentRoom}`);
        }
        
        // Join new room
        this.stompClient.send(`/app/chat.join/${roomId}`, {}, {});
        this.currentRoom = roomId;
        
        // Subscribe to the new room
        this.stompClient.subscribe(`/topic/room/${roomId}`, this._onMessageReceived.bind(this), { id: `room-${roomId}` });
        
        // Get room history
        this.stompClient.subscribe(`/app/chat.history/${roomId}`, this._onHistoryReceived.bind(this), { id: 'room-history' });
    }

    /**
     * Create a new chat room
     * @param {string} roomName - The name of the room to create
     */
    createRoom(roomName) {
        if (!this.connected) return;
        
        this.stompClient.send("/app/chat.create-room", {}, JSON.stringify({ name: roomName }));
    }

    /**
     * Handle connection success
     * @private
     */
    _onConnected() {
        this.connected = true;
        
        // Register the user
        this.stompClient.send("/app/chat.register", {}, JSON.stringify({ username: this.username }));
        
        // Subscribe to private messages
        this.stompClient.subscribe(`/user/queue/messages`, this._onPrivateMessageReceived.bind(this));
        
        // Subscribe to room list updates
        this.stompClient.subscribe('/app/chat.rooms', this._onRoomsReceived.bind(this));
        
        // Subscribe to user list updates
        this.stompClient.subscribe('/app/chat.users', this._onUsersReceived.bind(this));
        
        // Trigger the onConnected callback
        if (this.onConnected) {
            this.onConnected();
        }
    }

    /**
     * Handle connection error
     * @private
     * @param {Error} error - The connection error
     */
    _onError(error) {
        this.connected = false;
        
        if (this.onError) {
            this.onError(error);
        }
    }

    /**
     * Handle incoming room messages
     * @private
     * @param {Object} payload - The message payload
     */
    _onMessageReceived(payload) {
        const message = JSON.parse(payload.body);
        
        if (this.onMessageReceived) {
            this.onMessageReceived(message);
        }
        
        // Handle join/leave events
        if (message.type === 'JOIN' && this.onUserJoined) {
            this.onUserJoined(message);
        } else if (message.type === 'LEAVE' && this.onUserLeft) {
            this.onUserLeft(message);
        }
    }

    /**
     * Handle incoming private messages
     * @private
     * @param {Object} payload - The message payload
     */
    _onPrivateMessageReceived(payload) {
        const message = JSON.parse(payload.body);
        
        if (this.onPrivateMessageReceived) {
            this.onPrivateMessageReceived(message);
        }
    }

    /**
     * Handle room list updates
     * @private
     * @param {Object} payload - The room list payload
     */
    _onRoomsReceived(payload) {
        const rooms = JSON.parse(payload.body);
        
        if (this.onRoomsReceived) {
            this.onRoomsReceived(rooms);
        }
    }

    /**
     * Handle user list updates
     * @private
     * @param {Object} payload - The user list payload
     */
    _onUsersReceived(payload) {
        const users = JSON.parse(payload.body);
        
        if (this.onUsersReceived) {
            this.onUsersReceived(users);
        }
    }

    /**
     * Handle room history
     * @private
     * @param {Object} payload - The room history payload
     */
    _onHistoryReceived(payload) {
        const messages = JSON.parse(payload.body);
        
        if (this.onHistoryReceived) {
            this.onHistoryReceived(messages);
        }
    }
}