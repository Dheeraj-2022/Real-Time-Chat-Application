/**
 * Simple proxy server to fix CORS and WebSocket issues
 * Run this instead of a basic HTTP server
 */
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 8081;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Proxy WebSocket requests to the backend
app.use('/ws', createProxyMiddleware({
    target: 'http://localhost:8080',
    ws: true,
    changeOrigin: true
}));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server running at http://localhost:${PORT}`);
});