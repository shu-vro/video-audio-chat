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
                    p.peer.destroy();
                    return false;
                }
                return true;
            });
        });
    };

    const createPeer = (id: string, name: string, peer: Peer.Instance) => {
        setPeers((p) => [
            ...p,
            {
                id,
                name,
                peer,
                uniqueId: window.crypto
                    .getRandomValues(new Uint32Array(1))[0]
                    .toString(),
            },
        ]);
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
                    (roomId, remoteId, joiner_name) => {
                        toast(`${joiner_name} joined the call`, {
                            description: new Date().toString(),
                            action: {
                                label: "Ok",
                                onClick: () => null,
                            },
                        });
                        // everyone will now create a peer connection to remoteId
                        // lets talk of individuals
                        const peer = new Peer({
                            config: configuration(myHostname),
                            initiator: true,
                            stream: stream,
                        });

                        createPeer(remoteId, joiner_name, peer);

                        // get ready for call tells the remoteId that I am ready for calling.
                        // so make a peer and wait until I send the signal.
                        socket.emit(
                            "get ready for call",
                            remoteId,
                            socket.id,
                            my_name_state
                        );
                        // tell remoteId that I wanna connect, here is my signal data
                        peer.on("signal", (signal) => {
                            // console.log(
                            //     `sending ${remoteId} a signal with event`,
                            //     signal
                            // );
                            socket.emit("sending signal", {
                                to: remoteId,
                                signal,
                                callerId: socket.id,
                            });
                        });
                        socket.on("receiving returned signal", ({ signal }) => {
                            peer.signal(signal);
                        });

                        peer.on("close", () => {
                            destroyPeer(remoteId);
                        });
                        peer.on("end", () => {
                            destroyPeer(remoteId);
                        });
                        peer.on("error", (e) => {
                            destroyPeer(remoteId);
                        });
                    }
                );

                socket.on("create new peer", (callerId, callerName) => {
                    socket.on(
                        "new user responded",
                        ({ signal, callerId, callerName }) => {
                            const peer = new Peer({
                                config: configuration(myHostname),
                                // initiator: true,
                                stream: stream,
                            });

                            createPeer(callerId, callerName, peer);

                            peer.on("close", () => {
                                destroyPeer(callerId);
                            });
                            peer.on("end", () => {
                                destroyPeer(callerId);
                            });
                            peer.on("error", (e) => {
                                destroyPeer(callerId);
                            });
                            // console.log(
                            //     `received signal from veteran ${callerId}`,
                            //     signal
                            // );
                            // we found that somebody created a peer
                            // and now contacting us - a room member

                            peer.signal(signal);
                            // tell the new peer that I wanna connect
                            peer.on("signal", (signal) => {
                                // console.log("accepting call");
                                socket.emit("returning signal", {
                                    signal,
                                    to: callerId,
                                    // receiverId: socket.id,
                                });
                            });
                        }
                    );
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
