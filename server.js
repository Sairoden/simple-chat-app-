const path = require("path");
const http = require("http");

const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "./public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  console.log("New connection!");

  socket.on("join", (options, acknowledge) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) return acknowledge(error);

    socket.join(user.room);

    socket.emit(
      "message",
      generateMessage(`Hey ${user.username}, welcome to the Official Server of ${user.room}!
    `)
    );
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(`Let's welcome ${user.username}!`));

    acknowledge();
  });

  socket.on("sendMessage", (message, acknowledge) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message))
      return acknowledge("Please do not use any foul words.");

    io.to(user.room).emit("message", generateMessage(user.username, message));
    acknowledge();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user)
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} left the room`)
      );
  });

  socket.on("sendLocation", (location, acknowledge) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );

    acknowledge();
  });
});

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
