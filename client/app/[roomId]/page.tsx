"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatPanel from "./ChatPanel";
import VideoPanel from "./VideoPanel";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { ImperativePanelHandle } from "react-resizable-panels";
import useDeviceType from "@/hooks/useDeviceType";
import { useRouter } from "next/navigation";
import Peer from "simple-peer";
// @ts-ignore
import AdapterJs from "adapterjs";
import { PeerType } from "@/types/peer-types";

const configuration = (myHostname: string) => {
    return {
        iceServers: [
            // Information about ICE servers - Use your own!
            {
                urls: "turn:" + myHostname, // A TURN server
                username: "webrtc",
                credential: "turnserver",
            },
        ],
    };
};

export default function Rooms({
    params: { roomId },
}: {
    params: {
        roomId: string;
    };
}) {
    const router = useRouter();
    const panel = useRef<ImperativePanelHandle>();
    const device_type = useDeviceType();

    const searchParams = useSearchParams();
    let [my_name_state, setMy_name_state] = useState(
        Object.fromEntries(searchParams.entries()).my_name
    );
    const [myMediaStream, setMyMediaStream] = useState<MediaStream>();
    const [socket, setSocket] = useState(
        io(process.env.NEXT_PUBLIC_SERVER_URL as string)
    );
    // const socket = io(process.env.NEXT_PUBLIC_SERVER_URL as string);

    const [peers, setPeers] = useState<PeerType[]>([]);

    const handleDisconnect = (cb = () => {}) => {
        if (!socket.connected) return;
        toast(`The call is over`, {
            description:
                "If you think the call was cut unexpected, This can be a client error and would vanish with a refresh.",
            action: {
                label: "Rejoin",
                onClick: () => {
                    history.back();
                },
            },
        });
        console.log(`[client] disconnecting...`);
        socket.emit("user:user_disconnecting", roomId);
        socket.disconnect();
        cb();
    };

    const destroyPeer = (destroyId: string) => {
        setPeers((prev) => {
            return prev.filter((p) => {
                if (p.id === destroyId) {
                    console.log("destroying peer", p);
                    p.peer.close();
                    return false;
                }
                return true;
            });
        });
    };

    const createPeer = (id: string, name: string, peer: RTCPeerConnection) => {
        const uniqueId = window.crypto
            .getRandomValues(new Uint32Array(1))[0]
            .toString();
        setPeers((p) => [
            ...p,
            {
                id,
                name,
                peer,
                uniqueId,
            },
        ]);
        return uniqueId;
    };

    useEffect(() => {
        while (!my_name_state) {
            let getName = prompt("Write your name before joining") as string;
            // eslint-disable-next-line react-hooks/exhaustive-deps
            my_name_state = getName;
            router.push(`?my_name=${getName}`);
            setMy_name_state(getName);
        }

        socket.on("connect", async () => {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                },
                audio: true,
            });
            setMyMediaStream(stream);

            console.log("(client) socket id (useEffect):", socket.id);

            AdapterJs.webRTCReady((plugin: any) => {
                var myHostname = window.location.hostname;
                if (!myHostname) {
                    myHostname = "localhost";
                }
                socket.emit("user:join-room", roomId, socket.id, my_name_state);
                socket.on(
                    "server:someone-joined",
                    async (roomId, remoteId, joiner_name) => {
                        toast(`${joiner_name} joined the call`, {
                            description: new Date().toString(),
                            action: {
                                label: "Ok",
                                onClick: () => null,
                            },
                        });
                        const peerConnection = new RTCPeerConnection(
                            configuration(myHostname)
                        );

                        createPeer(remoteId, joiner_name, peerConnection);

                        stream.getTracks().forEach((track) => {
                            peerConnection.addTrack(track, stream);
                        });

                        peerConnection.onicecandidate = (event) => {
                            if (event.candidate) {
                                socket.emit(
                                    "candidate",
                                    event.candidate,
                                    remoteId
                                );
                            }
                        };

                        socket.on("candidate", async (candidate) => {
                            try {
                                console.log(candidate);
                                await peerConnection.addIceCandidate(
                                    new RTCIceCandidate(candidate)
                                );
                            } catch (e) {
                                console.error(
                                    "Error adding received ice candidate",
                                    e
                                );
                            }
                        });

                        const offer = await peerConnection.createOffer();
                        await peerConnection.setLocalDescription(offer);

                        socket.emit(
                            "get ready for call",
                            remoteId,
                            socket.id,
                            my_name_state
                        );

                        socket.emit("sending offer", offer, remoteId);

                        socket.on("answer", (answer) => {
                            console.log("received answer", answer);
                            peerConnection.setRemoteDescription(answer);
                        });
                    }
                );

                socket.on("create new peer", (callerId, callerName) => {
                    const peerConnection = new RTCPeerConnection(
                        configuration(myHostname)
                    );
                    peerConnection.ontrack = (event) => {
                        console.log(event.streams);
                    };

                    createPeer(callerId, callerName, peerConnection);

                    stream.getTracks().forEach((track) => {
                        peerConnection.addTrack(track, stream);
                    });

                    peerConnection.onicecandidate = (event) => {
                        if (event.candidate) {
                            socket.emit("candidate", event.candidate, callerId);
                        }
                    };

                    socket.on("candidate", async (candidate) => {
                        try {
                            await peerConnection.addIceCandidate(
                                new RTCIceCandidate(candidate)
                            );
                        } catch (e) {
                            console.error(
                                "Error adding received ice candidate",
                                e
                            );
                        }
                    });

                    socket.on("offer", async (offer, remoteId) => {
                        console.log(
                            "gained offer from remoteId",
                            offer,
                            remoteId
                        );
                        peerConnection.setRemoteDescription(offer);
                        const answer = await peerConnection.createAnswer();
                        await peerConnection.setLocalDescription(answer);

                        socket.emit("answer", answer, remoteId);
                    });
                });
                socket.on(
                    "server:somebody_is_leaving",
                    (joiner_name, joiner_id) => {
                        toast(`${joiner_name} left the call.`, {
                            description: new Date().toString(),
                            action: {
                                label: "Fine",
                                onClick: () => null,
                            },
                        });

                        destroyPeer(joiner_id);
                    }
                );
            });
        });

        socket.on("disconnecting", () => {
            handleDisconnect();
        });

        return () => {
            handleDisconnect();
        };
    }, []);

    console.log(peers);
    const handleChatBoxPanel = () => {
        if (!panel.current) return;

        const regain_value = device_type === "desktop" ? 25 : 100;

        if (panel.current.getSize() > 0) {
            panel.current.resize(0);
        } else {
            panel.current.resize(regain_value);
        }
    };

    const onRoomExit = () => {
        handleDisconnect(() => router.push("/"));
    };

    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="min-h-[calc(100vh-4rem)] w-full rounded-lg border-2">
            <ResizablePanel defaultSize={100}>
                <VideoPanel
                    sender_name={my_name_state}
                    roomId={roomId}
                    handleChatBoxPanel={handleChatBoxPanel}
                    peers={peers}
                    myMediaStream={myMediaStream}
                    onRoomExit={onRoomExit}
                />
            </ResizablePanel>
            <ResizableHandle withHandle />
            {/* @ts-ignore */}
            <ResizablePanel defaultSize={0} ref={panel}>
                <ChatPanel
                    socket={socket}
                    sender_name={my_name_state}
                    roomId={roomId}
                    handleChatBoxPanel={handleChatBoxPanel}
                />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
