const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors'); // Importa el middleware cors

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
      origin: '*',
    },
  });

app.use(cors({
    origin: '*', // Esto permitirá todas las solicitudes, ajusta según tu entorno
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }));

const rooms = {};


io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('login', ({ username, password, database }) => {
    // Create or join a room based on the database
    socket.join(database);
    if (!rooms[database]) rooms[database] = 0;
    rooms[database]++;
    updateRoomStatus();
  });

  // Evento de ejemplo: Ventas
  socket.on('ventas', (data) => {
    // Handle venta logic here
    console.log(`Evento Ventas recibido en la sala ${Object.keys(socket.rooms)[1]}`);
    // Puedes enviar una respuesta a los clientes de la sala si es necesario
    io.to(Object.keys(socket.rooms)[1]).emit('ventas_response', 'Venta realizada con éxito');
  });

  // Evento de ejemplo: Resto Artículos
  socket.on('resto_articulos', (data) => {
    // Handle resto_articulos logic here
    console.log(`Evento Resto Artículos recibido en la sala ${Object.keys(socket.rooms)[1]}`);
    // Puedes enviar una respuesta a los clientes de la sala si es necesario
    io.to(Object.keys(socket.rooms)[1]).emit('resto_articulos_response', 'Actualización de artículos realizada');
  });

  // ... (manejar otros eventos según sea necesario)

  socket.on('disconnect', () => {
    // Decrement room count on disconnect
    const roomsJoined = Object.keys(socket.rooms);
    roomsJoined.forEach((room) => {
      if (room !== socket.id) {
        rooms[room]--;
        updateRoomStatus();
      }
    });

    console.log('A user disconnected');
  });
});

function updateRoomStatus() {
  // Log room and connected user count
  Object.keys(rooms).forEach((room) => {
    const connectedUsers = io.sockets.adapter.rooms.get(room)?.size || 0;
    console.log(`${room}:${connectedUsers} users connected`);
  });
}

const port = process.env.PORT || 305;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
