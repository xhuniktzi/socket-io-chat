import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("usuario invalido"));
  }

  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  const users = [];
  const id_socket = socket.id;
  let username;

  for (let [id, socket] of io.of("/").sockets) {
    if (socket.username === "central")
      users.push({
        userID: id,
        username: socket.username,
      });

    if (socket.id === id_socket) {
      username = socket.username;
      users.push({
        userID: id,
        username: socket.username,
      });
    }
  }

  console.log(users);
  io.emit("users", users);

  socket.emit("receive", {
    message: `Bienvenido, ${username}`,
    userID: id_socket,
    username: "Sistema",
  });

  socket.on("send", ({ content, to }) => {
    console.log(`Mensaje: ${content} -> ${to}`);
    socket.to(to).emit("receive", content);
  });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
