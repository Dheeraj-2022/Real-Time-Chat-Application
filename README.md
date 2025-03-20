# Real-Time Chat Application

A simple but functional real-time chat application with a Java WebSocket backend and JavaScript frontend.

## Features

- **Real-time messaging** using WebSockets
- **User authentication** with username login
- **Multiple chat rooms** with ability to create new rooms
- **Private messaging** between users
- **Message persistence** during the session
- **User status** (online/offline) tracking
- **Clean, responsive UI** using Bootstrap

## Technologies Used

### Backend
- Java 11+
- Spring Boot
- Spring WebSockets with STOMP
- Maven

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5
- SockJS and STOMP.js for WebSocket communication

## Installation

### Prerequisites
- Java JDK 11 or higher
- Maven
- Node.js (optional, for proxy server)

### Backend Setup
1. Clone the repository:
   ```
   git clone https://github.com/Dheeraj-2022/Real-Time-Chat-Application.git
   cd Real-Time-Chat-Application
   ```

2. Navigate to the backend directory:
   ```
   cd backend
   ```

3. Run the Spring Boot application:
   ```
   mvn spring-boot:run
   ```
   The server will start on port 8080.

### Frontend Setup

#### Option 1: Using the Proxy Server (Recommended)
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Start the proxy server:
   ```
   npm start
   ```
   The frontend will be accessible at http://localhost:8081

#### Option 2: Using a Simple HTTP Server
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Start an HTTP server (e.g., using Python):
   ```
   # Python 3
   python -m http.server 8081
   
   # Python 2
   python -m SimpleHTTPServer 8081
   ```
   The frontend will be accessible at http://localhost:8081

## Usage

1. Open your browser and go to http://localhost:8081
2. Enter a username on the login screen
3. Start chatting in the "General" room
4. Create new rooms by clicking the "+" button next to "Rooms"
5. Join different rooms by clicking on their names
6. Send private messages by clicking the message icon next to a user's name
7. Logout by clicking the logout button next to your username
