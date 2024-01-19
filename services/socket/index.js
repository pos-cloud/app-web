const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  }),
);

const rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("login", ({ room }) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = 0;
    rooms[room]++;
    updateRoomStatus();
  });

  socket.on("update-table", ({room}) => {
    if (room) {
      io.to(room).emit("update-table");
    }
  });

  socket.on("reconnect", ({ room }) => {
    if(room) socket.join(room);
    if (!rooms[room]) rooms[room] = 0;
    rooms[room]++;
    updateRoomStatus();
  });

  socket.on("disconnect", () => {
    const roomsJoined = Object.keys(socket.rooms);
    roomsJoined.forEach((room) => {
      if (room !== socket.id) {
        rooms[room]--;
        updateRoomStatus();
      }
    });

    console.log("A user disconnected");
  });

});


function updateRoomStatus() {
  Object.keys(rooms).forEach((room) => {
    const connectedUsers = io.sockets.adapter.rooms.get(room)?.size || 0;
    console.log(`${room}:${connectedUsers} users connected`);
  });
}

const port = process.env.PORT || 306;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
