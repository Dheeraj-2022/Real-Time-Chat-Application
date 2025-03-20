package com.simplechat.service;

import com.simplechat.model.ChatMessage;
import com.simplechat.model.ChatRoom;
import com.simplechat.model.User;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatService {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, User> users = new ConcurrentHashMap<>();
    private final Map<String, ChatRoom> rooms = new ConcurrentHashMap<>();

    // Initialize with a general room
    public ChatService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
        // Create a default "General" chat room
        String generalRoomId = "general";
        rooms.put(generalRoomId, new ChatRoom(generalRoomId, "General"));
    }

    public User registerUser(String username, String sessionId) {
        User user = users.getOrDefault(username, new User(username));
        user.setSessionId(sessionId);
        user.setOnline(true);
        users.put(username, user);
        return user;
    }

    public void disconnectUser(String username) {
        User user = users.get(username);
        if (user != null) {
            user.setOnline(false);
            
            // Notify all rooms the user was in about their departure
            for (String roomId : user.getRooms()) {
                ChatRoom room = rooms.get(roomId);
                if (room != null) {
                    room.removeUser(username);
                    
                    // Create a leave message
                    ChatMessage leaveMessage = new ChatMessage(
                            username + " has left the room", 
                            username, 
                            roomId, 
                            ChatMessage.MessageType.LEAVE);
                    
                    // Broadcast the leave message
                    broadcastMessage(leaveMessage);
                }
            }
        }
    }

    public ChatRoom createRoom(String roomName) {
        String roomId = UUID.randomUUID().toString();
        ChatRoom room = new ChatRoom(roomId, roomName);
        rooms.put(roomId, room);
        return room;
    }

    public void joinRoom(String username, String roomId) {
        User user = users.get(username);
        ChatRoom room = rooms.get(roomId);
        
        if (user != null && room != null) {
            room.addUser(username);
            user.joinRoom(roomId);
            
            // Create a join message
            ChatMessage joinMessage = new ChatMessage(
                    username + " has joined the room", 
                    username, 
                    roomId, 
                    ChatMessage.MessageType.JOIN);
            
            // Broadcast the join message
            broadcastMessage(joinMessage);
        }
    }

    public void leaveRoom(String username, String roomId) {
        User user = users.get(username);
        ChatRoom room = rooms.get(roomId);
        
        if (user != null && room != null) {
            room.removeUser(username);
            user.leaveRoom(roomId);
            
            // Create a leave message
            ChatMessage leaveMessage = new ChatMessage(
                    username + " has left the room", 
                    username, 
                    roomId, 
                    ChatMessage.MessageType.LEAVE);
            
            // Broadcast the leave message
            broadcastMessage(leaveMessage);
        }
    }

    public List<ChatRoom> getRooms() {
        return new ArrayList<>(rooms.values());
    }

    public ChatRoom getRoom(String roomId) {
        return rooms.get(roomId);
    }

    public List<ChatMessage> getRoomMessages(String roomId, int count) {
        ChatRoom room = rooms.get(roomId);
        return room != null ? room.getRecentMessages(count) : new ArrayList<>();
    }

    public void broadcastMessage(ChatMessage message) {
        ChatRoom room = rooms.get(message.getRoomId());
        
        if (room != null) {
            // Store the message
            message.setId(UUID.randomUUID().toString());
            room.addMessage(message);
            
            // Broadcast to room
            messagingTemplate.convertAndSend("/topic/room/" + message.getRoomId(), message);
        }
    }

    public void sendPrivateMessage(ChatMessage message) {
        // Set message type to PRIVATE
        message.setType(ChatMessage.MessageType.PRIVATE);
        message.setId(UUID.randomUUID().toString());
        
        // Send to recipient
        messagingTemplate.convertAndSendToUser(
                message.getRecipient(), 
                "/queue/messages", 
                message);
        
        // Send copy to sender
        messagingTemplate.convertAndSendToUser(
                message.getSender(), 
                "/queue/messages", 
                message);
    }

    public List<User> getOnlineUsers() {
        List<User> onlineUsers = new ArrayList<>();
        users.values().forEach(user -> {
            if (user.isOnline()) {
                onlineUsers.add(user);
            }
        });
        return onlineUsers;
    }
}