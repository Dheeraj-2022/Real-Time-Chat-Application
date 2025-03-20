package com.simplechat.model;

import java.util.HashSet;
import java.util.Set;

public class User {

    private String username;
    private String sessionId;
    private Set<String> rooms = new HashSet<>();
    private boolean online;

    public User() {
    }

    public User(String username) {
        this.username = username;
        this.online = true;
    }

    public void joinRoom(String roomId) {
        rooms.add(roomId);
    }

    public void leaveRoom(String roomId) {
        rooms.remove(roomId);
    }

    // Getters and setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public Set<String> getRooms() {
        return rooms;
    }

    public void setRooms(Set<String> rooms) {
        this.rooms = rooms;
    }

    public boolean isOnline() {
        return online;
    }

    public void setOnline(boolean online) {
        this.online = online;
    }
}