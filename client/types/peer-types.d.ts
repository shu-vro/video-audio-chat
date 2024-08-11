import Peer from "simple-peer";

type PeerType = {
    uniqueId: string;
    id: string;
    name: string;
    peer: RTCPeerConnection;
};
