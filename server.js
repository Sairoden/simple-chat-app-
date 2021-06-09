const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "./public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  console.log("New connection!");

  socket.emit("message", "Welcome");
  socket.broadcast.emit("message", "Let's welcome a new user!");

  socket.on("sendMessage", message => {
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    io.emit("message", "User left the room");
  });

  socket.on("sendLocation", location => {
    io.emit(
      "message",
      `https://google.com/maps?q=${location.latitude},${location.longitude}`
    );
  });
});

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
