// server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// Configuración de Express
const app = express();
app.use(cors()); // Permite peticiones CORS (ajusta el origen según tu caso)

// Crear servidor HTTP a partir de Express
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://transporte.a3cli.com", // Puedes restringir el origen si lo deseas
    methods: ["GET", "POST"],
    credentials: true
  },
});





// Lógica de Socket.IO
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  // Evento: solicitud de viaje en tiempo real
  socket.on("rideRequest", (data) => {
    console.log("Solicitud de viaje recibida:", data);
    // Aquí puedes agregar lógica para seleccionar qué drivers deben recibir la solicitud.
    // Por ejemplo, emitir la solicitud a una sala en específico.
    // En este ejemplo se emite a todos los clientes conectados.
    io.emit("rideRequest", data);
  });

  // Evento: aceptación de la solicitud de viaje por parte del driver
  socket.on("rideAccepted", (data) => {
    console.log("Solicitud aceptada:", data);
    // Se espera que data incluya por ejemplo: { room, riderId, driverId }
    // Únete a una sala (room) para que ambos usuarios (driver y rider) puedan comunicarse.
    socket.join(data.room);
    // Notifica a todos en esa sala que la solicitud fue aceptada.
    io.to(data.room).emit("rideAccepted", data);
  });

  // Evento: un usuario se une a una sala (por ejemplo, para chat o rastreo)
  socket.on("joinRoom", (data) => {
    const room = data.room;
    socket.join(room);
    console.log(socket.id, "se unió a la sala", room);
  });

  // // Evento: actualización de ubicación en tiempo real
  // socket.on("locationUpdate", (data) => {
  //   // data debe incluir { room, lat, lng, userType }
  //   const room = data.room;
  //   io.to(room).emit("locationUpdate", data);
  // });

  // Usuario emite su ubicación en tiempo real
  socket.on("locationUpdate", (data) => {
    // data: { room, lat, lng, userId, userType }
    console.log("locationUpdate:", data);
    io.to(data.room).emit("locationUpdate", data);
  });

  // Evento para detener el envío de la geolocalización
  socket.on("stopLocationSharing", (data) => {
    // data: { room, userId }
    // Informa a los demás usuarios de la sala que 'userId' dejó de compartir su ubicación
    io.to(data.room).emit("locationSharingStopped", data);
  });




  // Evento: mensaje de chat en la sala
  socket.on("chatMessage", (data) => {
    // data debe incluir { room, message, sender }
    const room = data.room;
    io.to(room).emit("chatMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Levantar el servidor en el puerto 5000 (o el que prefieras)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Servidor de Socket.IO corriendo en el puerto ${PORT}`));
