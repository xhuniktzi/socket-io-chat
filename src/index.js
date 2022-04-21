import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
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

  //   for (let [id, socket] of io.of("/").sockets) {
  //     if (socket.username === username)
  //       return next(new Error("ese usuario ya existe"));
  //   }

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
  io.emit("users", users);

  //   console.log(id_socket);

  socket.emit("receive", {
    message: `Bienvenido, ${username}`,
    userID: id_socket,
    username: "Sistema",
  });
  //   .to(id_socket)

  socket.on("send", ({ content, to }) => {
    // console.log(content);
    // console.log(to);
    socket.to(to).emit("receive", content);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
