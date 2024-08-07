"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { ExpressPeerServer } from "peer";
const app = (0, express_1.default)();
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const admin_ui_1 = require("@socket.io/admin-ui");
const httpServer = (0, http_1.createServer)(app);
// ---------------- peerJs setup --------------------
// const peerServer = ExpressPeerServer(httpServer, {});
// app.use("/peer_backend", peerServer);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io", "http://localhost:3000"],
        credentials: true,
    },
    // options
});
(0, admin_ui_1.instrument)(io, {
    auth: false,
    mode: "development",
});
io.on("connection", (socket) => {
    console.log("[server]: new connection: ", socket.id);
    socket.data.name = "unknown";
    // someone is requesting to join room
    socket.on("user:join-room", (roomId, socketId, joiner_name) => __awaiter(void 0, void 0, void 0, function* () {
        socket.join(roomId);
        socket.data.name = joiner_name;
        console.log(`[server]: ${joiner_name} joining ${roomId}`);
        socket
            .to(roomId)
            .emit("server:someone-joined", roomId, socketId, joiner_name);
    }));
    // someone left
    socket.on("user:user_disconnecting", (roomId) => {
        socket.leave(roomId);
        console.log(`[server]: ${socket.data.name} left ${roomId}`);
        socket.emit("server:somebody_is_leaving", socket.data.name);
    });
    // someone sending a message.
    socket.on("user:message_sent_to_room", (roomId, userId, sender_name, message, type, time) => {
        console.log(message);
        io.to(roomId).emit("server:send_message_to_everyone", userId, sender_name, message, type, time);
    });
    socket.on("sending signal", (payload) => {
        // payload.to => the new user
        io.to(payload.to).emit("new user responded", {
            signal: payload.signal,
            callerId: payload.callerId,
            callerName: socket.data.name,
        });
    });
    socket.on("returning signal", (payload) => {
        io.to(payload.to).emit("receiving returned signal", {
            signal: payload.signal,
            // id: payload.receiverId,
        });
    });
    // when user is disconnected
    socket.on("disconnecting", () => {
        console.log(`[server]: disconnecting ${socket.id}`);
        socket.rooms.forEach((roomId) => {
            if (roomId === socket.id)
                return;
            io.to(roomId).emit("server:somebody_is_leaving", socket.data.name, socket.id);
        });
    });
});
function closeSocketsNotInRoom() {
    return __awaiter(this, void 0, void 0, function* () {
        const sockets = yield io.fetchSockets();
        sockets.forEach((socket) => {
            if (socket.rooms.size <= 1) {
                console.log(`[server]: closing socket ${socket.id} not in a room`);
                socket.disconnect(true);
            }
        });
    });
}
setInterval(closeSocketsNotInRoom, 1000 * 20);
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`http server running on http://localhost:${PORT}`);
});
