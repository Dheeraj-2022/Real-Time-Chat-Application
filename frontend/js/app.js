/**
 * Main application script for the Simple Chat
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginPage = document.getElementById('login-page');
    const chatPage = document.getElementById('chat-page');
    const loginForm = document.getElementById('login-form');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messageArea = document.getElementById('message-area');
    const roomList = document.getElementById('room-list');
    const userList = document.getElementById('user-list');
    const connectedUser = document.getElementById('connected-user');
    const currentRoomName = document.getElementById('current-room-name');
    const logoutBtn = document.getElementById('logout-btn');
    const createRoomForm = document.getElementById('create-room-form');
    const createRoomModal = new bootstrap.Modal(document.getElementById('createRoomModal'));
    const privateMessageForm = document.getElementById('private-message-form');
    const privateMessageModal = new bootstrap.Modal(document.getElementById('privateMessageModal'));
    const privateMessageRecipient = document.getElementById('private-msg-recipient');
    const recipientUsername = document.getElementById('recipient-username');
    const privateMessage = document.getElementById('private-message');
    
    // Create chat client
    const chatClient = new ChatClient();
    
    // Format timestamp
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Add message to the UI
    function addMessage(message, prepend = false) {
        const messageElement = document.createElement('div');
        
        if (message.type === 'JOIN' || message.type === 'LEAVE') {
            // System message (join/leave)
            messageElement.classList.add('system-message');
            messageElement.textContent = message.content;
        } else if (message.type === 'PRIVATE') {
            // Private message
            messageElement.classList.add('message', 'private-message');
            
            const header = document.createElement('div');
            header.classList.add('d-flex', 'justify-content-between');
            
            const sender = document.createElement('span');
            sender.classList.add('message-sender');
            sender.textContent = message.sender === chatClient.username ? 
                `You to ${message.recipient}` : `${message.sender} to You`;
            
            const time = document.createElement('span');
            time.classList.add('message-time');
            time.textContent = formatTimestamp(message.timestamp);
            
            header.appendChild(sender);
            header.appendChild(time);
            
            const content = document.createElement('div');
            content.textContent = message.content;
            
            messageElement.appendChild(header);
            messageElement.appendChild(content);
        } else {
            // Regular chat message
            const isSentByMe = message.sender === chatClient.username;
            messageElement.classList.add('message');
            messageElement.classList.add(isSentByMe ? 'message-sent' : 'message-received');
            
            const header = document.createElement('div');
            header.classList.add('d-flex', 'justify-content-between');
            
            const sender = document.createElement('span');
            sender.classList.add('message-sender');
            sender.textContent = isSentByMe ? 'You' : message.sender;
            
            const time = document.createElement('span');
            time.classList.add('message-time');
            time.textContent = formatTimestamp(message.timestamp);
            
            header.appendChild(sender);
            header.appendChild(time);
            
            const content = document.createElement('div');
            content.textContent = message.content;
            
            messageElement.appendChild(header);
            messageElement.appendChild(content);
        }
        
        if (prepend) {
            messageArea.prepend(messageElement);
        } else {
            messageArea.appendChild(messageElement);
            // Scroll to the bottom
            messageArea.scrollTop = messageArea.scrollHeight;
        }
    }
    
    // Update room list
    function updateRoomList(rooms) {
        roomList.innerHTML = '';
        
        rooms.forEach(room => {
            const roomElement = document.createElement('li');
            roomElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            roomElement.textContent = room.name;
            
            if (room.id === chatClient.currentRoom) {
                roomElement.classList.add('active');
            }
            
            roomElement.addEventListener('click', () => {
                chatClient.joinRoom(room.id);
                currentRoomName.textContent = room.name;
                
                // Update active room in UI
                document.querySelectorAll('#room-list .list-group-item').forEach(el => {
                    el.classList.remove('active');
                });
                roomElement.classList.add('active');
                
                // Clear message area
                messageArea.innerHTML = '';
            });
            
            roomList.appendChild(roomElement);
        });
    }
    
    // Update user list
    function updateUserList(users) {
        userList.innerHTML = '';
        
        users.forEach(user => {
            if (user.username === chatClient.username) return;
            
            const userElement = document.createElement('li');
            userElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            
            // Create user display with online indicator
            const userDisplay = document.createElement('div');
            userDisplay.innerHTML = `
                <span class="online-indicator me-1">●</span>
                <span>${user.username}</span>
            `;
            userDisplay.querySelector('.online-indicator').style.color = user.online ? '#28a745' : '#dc3545';
            
            // Create message button
            const messageBtn = document.createElement('button');
            messageBtn.classList.add('btn', 'btn-sm', 'btn-outline-light');
            messageBtn.innerHTML = '<i class="bi bi-chat-dots"></i>';
            messageBtn.addEventListener('click', () => {
                recipientUsername.value = user.username;
                privateMessageRecipient.textContent = user.username;
                privateMessageModal.show();
            });
            
            userElement.appendChild(userDisplay);
            userElement.appendChild(messageBtn);
            userList.appendChild(userElement);
        });
    }
    
    // Set up event handlers for the chat client
    chatClient.onConnected = () => {
        console.log('Connected to the chat server');
        loginPage.classList.add('d-none');
        chatPage.classList.remove('d-none');
        connectedUser.textContent = chatClient.username;
        messageInput.focus();
    };
    
    chatClient.onError = (error) => {
        console.error('Could not connect to the chat server', error);
        
        // Show a more detailed error with troubleshooting help
        const errorMessage = 'Connection to server failed. Please ensure:\n\n' +
                            '1. The backend server is running on port 8080\n' +
                            '2. You\'re using the proxy.js server (npm start)\n' +
                            '3. Your browser allows WebSocket connections\n\n' +
                            'Technical details: ' + (error ? error.toString() : 'Unknown error');
        
        alert(errorMessage);
        
        // Try to reconnect in 5 seconds
        setTimeout(() => {
            if (confirm('Try to reconnect to the server?')) {
                chatClient.connect(chatClient.username || document.getElementById('username').value.trim());
            }
        }, 5000);
    };
    
    chatClient.onMessageReceived = (message) => {
        addMessage(message);
    };
    
    chatClient.onPrivateMessageReceived = (message) => {
        addMessage(message);
    };
    
    chatClient.onRoomsReceived = (rooms) => {
        updateRoomList(rooms);
    };
    
    chatClient.onUsersReceived = (users) => {
        updateUserList(users);
    };
    
    chatClient.onHistoryReceived = (messages) => {
        // Clear message area first
        messageArea.innerHTML = '';
        
        // Add messages in reverse order (oldest first)
        messages.forEach(message => {
            addMessage(message);
        });
    };
    
    // Event listeners
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        
        if (username) {
            chatClient.connect(username);
        }
    });
    
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = messageInput.value.trim();
        
        if (content) {
            chatClient.sendMessage(content);
            messageInput.value = '';
            messageInput.focus();
        }
    });
    
    createRoomForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const roomName = document.getElementById('room-name').value.trim();
        
        if (roomName) {
            chatClient.createRoom(roomName);
            document.getElementById('room-name').value = '';
            createRoomModal.hide();
        }
    });
    
    privateMessageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const recipient = recipientUsername.value;
        const content = privateMessage.value.trim();
        
        if (recipient && content) {
            chatClient.sendPrivateMessage(recipient, content);
            privateMessage.value = '';
            privateMessageModal.hide();
        }
    });
    
    logoutBtn.addEventListener('click', () => {
        chatClient.disconnect();
        chatPage.classList.add('d-none');
        loginPage.classList.remove('d-none');
        messageArea.innerHTML = '';
    });
});