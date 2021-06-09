const path = require("path");
const http = require("http");

const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages.js");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "./public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  console.log("New connection!");

  socket.emit("message", generateMessage("Welcome!"));
  socket.broadcast.emit(
    "message",
    generateMessage("Let's welcome a new user!")
  );

  socket.on("sendMessage", (message, acknowledge) => {
    const filter = new Filter();

    if (filter.isProfane(message))
      return acknowledge("Please do not use any foul words.");

    io.emit("message", generateMessage(message));
    acknowledge();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("User left the room"));
  });

  socket.on("sendLocation", (location, acknowledge) => {
    io.emit(
      "locationMessage",
      generateLocationMessage(
        `https://google.com/maps?q=${location.latitude},${location.longitude}`,
      )
    );

    acknowledge();
  });
});

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
