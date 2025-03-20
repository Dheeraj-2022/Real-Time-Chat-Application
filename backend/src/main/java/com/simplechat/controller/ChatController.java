package com.simplechat.controller;

import com.simplechat.model.ChatMessage;
import com.simplechat.model.ChatRoom;
import com.simplechat.model.User;
import com.simplechat.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/chat.register")
    public void register(@Payload Map<String, String> registerData, SimpMessageHeaderAccessor headerAccessor) {
        String username = registerData.get("username");
        String sessionId = headerAccessor.getSessionId();
        User user = chatService.registerUser(username, sessionId);
        
        // Add username to WebSocket session attributes
        headerAccessor.getSessionAttributes().put("username", username);
        
        // Join the general room by default
        chatService.joinRoom(username, "general");
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage message) {
        chatService.broadcastMessage(message);
    }

    @MessageMapping("/chat.private")
    public void sendPrivateMessage(@Payload ChatMessage message) {
        chatService.sendPrivateMessage(message);
    }

    @MessageMapping("/chat.join/{roomId}")
    public void joinRoom(@DestinationVariable String roomId, SimpMessageHeaderAccessor headerAccessor) {
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        chatService.joinRoom(username, roomId);
    }

    @MessageMapping("/chat.leave/{roomId}")
    public void leaveRoom(@DestinationVariable String roomId, SimpMessageHeaderAccessor headerAccessor) {
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        chatService.leaveRoom(username, roomId);
    }

    @MessageMapping("/chat.create-room")
    public void createRoom(@Payload Map<String, String> roomData, SimpMessageHeaderAccessor headerAccessor) {
        String roomName = roomData.get("name");
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        
        // Create the room
        ChatRoom room = chatService.createRoom(roomName);
        
        // Join the creator to the room
        chatService.joinRoom(username, room.getId());
    }

    @SubscribeMapping("/chat.rooms")
    public List<ChatRoom> getRooms() {
        return chatService.getRooms();
    }

    @SubscribeMapping("/chat.users")
    public List<User> getUsers() {
        return chatService.getOnlineUsers();
    }

    @SubscribeMapping("/chat.history/{roomId}")
    public List<ChatMessage> getRoomHistory(@DestinationVariable String roomId) {
        // Return last 50 messages
        return chatService.getRoomMessages(roomId, 50);
    }
}