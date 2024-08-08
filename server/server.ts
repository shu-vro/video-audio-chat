import express from "express";
// import { ExpressPeerServer } from "peer";
const app = express();

import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const httpServer = createServer(app);

const _printFn = console.log;
console.log = function (...args: any) {
    _printFn(`[server]:[${new Date().toLocaleTimeString()}]:`, ...args);
};

// ---------------- peerJs setup --------------------
// const peerServer = ExpressPeerServer(httpServer, {});
// app.use("/peer_backend", peerServer);

const io = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io", "http://localhost:3000"],
        credentials: true,
    },
    // options
});

instrument(io, {
    auth: false,
    mode: "development",
});

io.on("connection", (socket: Socket) => {
    // console.log("new connection: ", socket.id);

    socket.data.name = "unknown";

    // someone is requesting to join room
    socket.on("user:join-room", async (roomId, socketId, joiner_name) => {
        socket.join(roomId);

        socket.data.name = joiner_name;
        // console.log(`${joiner_name} joining ${roomId}`);
        socket
            .to(roomId)
            .emit("server:someone-joined", roomId, socketId, joiner_name);
    });

    // someone left
    socket.on("user:user_disconnecting", (roomId) => {
        const id = socket.id;
        socket.leave(roomId);
        console.log(`${socket.data.name} left ${roomId}`);
        io.to(roomId).emit("server:somebody_is_leaving", socket.data.name, id);
    });

    // someone sending a message.
    socket.on(
        "user:message_sent_to_room",
        (roomId, userId, sender_name, message, type, time) => {
            io.to(roomId).emit(
                "server:send_message_to_everyone",
                userId,
                sender_name,
                message,
                type,
                time
            );
        }
    );

    socket.on("get ready for call", (remoteId, callerId, callerName) => {
        // payload.to => the new user
        io.to(remoteId).emit("create new peer", callerId, callerName);
    });
    socket.on("sending offer", (offer, remoteId) => {
        io.to(remoteId).emit("offer", offer, socket.id);
    });
    socket.on("answer", (answer, id) => {
        io.to(id).emit("answer", answer);
    });
    socket.on("candidate", (candidate, id) => {
        io.to(id).emit("candidate", candidate);
    });

    // when user is disconnected
    socket.on("disconnecting", () => {
        console.log(`disconnecting ${socket.id}`);
        socket.rooms.forEach((roomId) => {
            if (roomId === socket.id) return;
            io.to(roomId).emit(
                "server:somebody_is_leaving",
                socket.data.name,
                socket.id
            );
        });
    });
});

async function closeSocketsNotInRoom() {
    const sockets = await io.fetchSockets();
    sockets.forEach((socket) => {
        if (socket.rooms.size <= 1) {
            // console.log(`closing socket ${socket.id} not in a room`);
            socket.disconnect(true);
        }
    });
}

setInterval(closeSocketsNotInRoom, 1000 * 20);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`http server running on http://localhost:${PORT}`);
});
