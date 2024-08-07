/// <reference types="simple-peer" />

type MessageType = {
    userId: string;
    sender_name: string;
    message: string;
    type: "info" | "message";
    time: number;
};

type PeerType = {
    id: string;
    name: string;
    peer: Peer.Instance;
};
