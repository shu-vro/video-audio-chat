"use client";

import { Socket, io } from "socket.io-client";

export interface ServerToClientEvents {
    "user:join-room": (
        roomId: string,
        room_name: string,
        your_name: string
    ) => void;
    "server:someone-joined": (roomId: string) => void;
}

export interface ClientToServerEvents extends ServerToClientEvents {}

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NEXT_PUBLIC_SERVER_URL as string;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    process.env.NEXT_PUBLIC_SERVER_URL as string
);
