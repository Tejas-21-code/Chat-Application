const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const express = require("express");
const Filter = require("bad-words");
const {
  addUser,
  getUser,
  removeUser,
  getUserInRoom,
} = require("./utils/users");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "../public");

app.use(express.static(publicPath));

io.on("connection", (socket) => {
  console.log("New Websocket Connection");

  socket.on("join", ({ Username, Room }, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      Username,
      Room,
    });
    if (error) {
      return callback(error);
    }

    socket.join(user.Room);

    socket.emit(
      "message",
      generateMessage(user.Username, "Welcome to the chat")
    );
    socket.broadcast
      .to(user.Room)
      .emit(
        "message",
        generateMessage(user.Username, `A Wild ${user.Username} has appeared`)
      );
    io.to(user.Room).emit("roomData", {
      Room: user.Room,
      users: getUserInRoom(user.Room),
    });
    callback();
  });
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profane words are not allowed");
    }
    io.to(user.Room).emit("message", generateMessage(user.Username, message));
    callback();
  });

  socket.on("sendLocation", ({ latitude, longitude }, callback) => {
    const user = getUser(socket.id);
    io.to(user.Room).emit(
      "locationmessage",
      generateLocationMessage(
        user.Username,
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    );
    callback("location delivered");
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    // console.log(user);
    if (user) {
      io.to(user.Room).emit(
        "message",
        generateMessage(user.Username, `${user.Username} has left`)
      );
      io.to(user.Room).emit("roomData", {
        Room: user.Room,
        users: getUserInRoom(user.Room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("Server is Running on Port " + port);
});
