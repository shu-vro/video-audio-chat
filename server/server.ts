import express from "express";
// import { ExpressPeerServer } from "peer";
const app = express();

import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const httpServer = createServer(app);

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
    console.log("[server]: new connection: ", socket.id);

    socket.data.name = "unknown";

    console.log(socket.id);

    // someone is requesting to join room
    socket.on("user:join-room", async (roomId, socketId, joiner_name) => {
        socket.join(roomId);

        socket.data.name = joiner_name;
        console.log(`[server]: ${joiner_name} joining ${roomId}`);
        socket
            .to(roomId)
            .emit("server:someone-joined", roomId, socketId, joiner_name);
    });

    // someone left
    socket.on("user:user_disconnecting", (roomId) => {
        socket.leave(roomId);
        console.log(`[server]: ${socket.data.name} left ${roomId}`);
        socket.emit("server:somebody_is_leaving", socket.data.name);
    });

    // someone sending a message.
    socket.on(
        "user:message_sent_to_room",
        (roomId, userId, sender_name, message, type, time) => {
            console.log(message);
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

    socket.on("sending signal", (payload) => {
        // payload.to => the new user
        io.to(payload.to).emit("new user responded", {
            signal: payload.signal,
            callerId: payload.callerId,
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
        console.log(`[server]: disconnecting... ${socket.id}`, socket.rooms);
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

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`http server running on http://localhost:${PORT}`);
});

/*
io.on("connection", (socket) => {
    console.log(`       ----------- connected: ${socket.id} -----------`);
    let allSockets;
    socket.on("join-room", async (ROOM_ID) => {
        let roomExists = io.sockets.adapter.rooms.get(ROOM_ID);
        socket.join(ROOM_ID);
        socket.in(ROOM_ID).emit("user-joined", socket.id);
        allSockets = Array.from((await io.in(ROOM_ID).allSockets()).keys());
        socket.to(allSockets[0]).emit("member-joined", socket.id);
        if (!roomExists) {
            console.log(`room: ${ROOM_ID}   -----   admin: ${socket.id}`);
            socket.to(socket.id).emit("room-admin");
        }
    });

    socket.on("disconnect", () => {
        console.log(
            `       ----------- disconnected: ${socket.id} -----------`
        );
    });
});
*/
