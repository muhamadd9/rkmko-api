import express from "express";
import * as dotenv from "dotenv";
import path from "node:path";
import { createServer } from "http";
import { Server } from "socket.io";

// Load env from multiple common locations (first wins)
dotenv.config({ path: path.resolve("./src/config/.env.dev") });
dotenv.config({ path: path.resolve("./src/config/.env") });
dotenv.config({ path: path.resolve("./.env.dev") });
dotenv.config({ path: path.resolve("./.env") });
import bootstrap from "./src/app.controller.js";

const app = express();
const server = createServer(app);

export const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

const port = process.env.PORT || 3400;
app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "from", socket.handshake.address);

  socket.on("connect_error", (error) => {
    console.error("Server-side connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, "Reason:", reason);
  });
});

bootstrap(app, express, corsOptions);

server.listen(port, () => console.log(`Server listening on port ${port}!`));
