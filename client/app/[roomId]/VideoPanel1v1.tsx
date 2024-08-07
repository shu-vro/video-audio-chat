"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import { FaVideo, FaVideoSlash, FaMicrophoneLinesSlash } from "react-icons/fa6";
import { MdCallEnd } from "react-icons/md";
import { FaMicrophoneAlt } from "react-icons/fa";
import { BsChatSquareDotsFill } from "react-icons/bs";
import { HiUserAdd } from "react-icons/hi";
import Link from "next/link";
import { Socket } from "socket.io-client";
import { SocketEvents } from "./ChatPanel";
import { toast } from "sonner";
import Peer, { SimplePeer } from "simple-peer";
import { cn } from "@/lib/utils";

function Video({ peer }: { peer: Peer.Instance }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [streamReady, setStreamReady] = useState(false);

    useEffect(() => {
        console.log(peer);
        peer.on("stream", (stream) => {
            setStreamReady(true);
            console.log("incoming stream", stream);
            videoRef.current!.srcObject = stream;
            videoRef.current!.autoplay = true;
        });
    }, []);
    return (
        <div
            className={cn(
                "w-[calc(50%-12px)] h-1/2 border-cyan-400 border border-solid",
                {
                    hidden: !streamReady,
                }
            )}>
            <video
                src=""
                className="w-full h-full"
                style={{
                    transform: "rotateY(180deg)",
                }}
                ref={videoRef}></video>
        </div>
    );
}

export default function VideoPanel({
    socket,
    sender_name,
    roomId,
    handleChatBoxPanel,
    peers,
    myMediaStream,
}: {
    socket: Socket<SocketEvents, SocketEvents>;
    sender_name: string;
    roomId: string;
    handleChatBoxPanel: () => void;
    peers: Peer.Instance[];
    myMediaStream?: MediaStream;
}) {
    const [videoEnabled, setVideoEnabled] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const my_video_ref = useRef<HTMLVideoElement>(null);

    const handleDisconnect = () => {
        if (!socket.connected) return;
        console.log(`[client] disconnecting...`);
        socket.emit("user:user_disconnecting", roomId);
        socket.disconnect();
    };

    useEffect(() => {
        (async () => {
            try {
                const timeout = setInterval(async () => {
                    if (socket.connected) {
                        toast(`Video panel ready to go`, {
                            action: {
                                label: "Ok",
                                onClick: () => null,
                            },
                        });
                        clearInterval(timeout);
                    }
                }, 1000);
            } catch (error: any) {
                toast("Error: " + error.message, {
                    action: {
                        label: "Ok",
                        onClick: () => null,
                    },
                });
                console.log(error);
            }
        })();
        return () => {
            // handleDisconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!my_video_ref.current || !myMediaStream) return;

        const video = my_video_ref.current;
        video.srcObject = myMediaStream;
        video.addEventListener("loadedmetadata", () => {
            if (!video) return;
            video.play();
        });

        if (myMediaStream.getVideoTracks()[0].enabled) {
            setVideoEnabled(true);
        }
        if (myMediaStream.getAudioTracks()[0].enabled) {
            setAudioEnabled(true);
        }

        return () => {
            if (myMediaStream) {
                myMediaStream.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        };
    }, [myMediaStream]);

    return (
        <div className="flex flex-col gap-5 h-[calc(100vh-5rem)]">
            <div className="flex justify-center items-center h-[calc(100%-4rem)] w-full gap-3 flex-wrap">
                <div className="w-[calc(50%-12px)] h-1/2 border-cyan-400 border border-solid">
                    <video
                        src=""
                        className="w-full h-full"
                        style={{
                            transform: "rotateY(180deg)",
                        }}
                        ref={my_video_ref}></video>
                </div>
                {peers.map((peer, i) => (
                    <Video key={i} peer={peer} />
                ))}
            </div>
            <div className="h-16 w-full grid place-items-center">
                <div className="bg-neutral-400 dark:bg-neutral-500 flex gap-4 rounded-full">
                    <Button
                        size="icon"
                        asChild
                        className="rounded-full w-12 h-12 text-xl bg-red-500 text-white hover:bg-red-700">
                        <Link href="/">
                            <MdCallEnd />
                        </Link>
                    </Button>
                    <Button
                        onClick={() => {
                            if (myMediaStream) {
                                if (myMediaStream.getVideoTracks()[0].enabled) {
                                    myMediaStream.getVideoTracks()[0].enabled =
                                        false;
                                    setVideoEnabled(false);
                                } else {
                                    myMediaStream.getVideoTracks()[0].enabled =
                                        true;
                                    setVideoEnabled(true);
                                }
                            }
                        }}
                        size="icon"
                        className={cn(
                            "rounded-full w-12 h-12 text-xl",
                            videoEnabled
                                ? "bg-inherit"
                                : "bg-red-500 hover:bg-red-700 text-white"
                        )}>
                        {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
                    </Button>
                    <Button
                        onClick={() => {
                            if (myMediaStream) {
                                if (myMediaStream.getAudioTracks()[0].enabled) {
                                    myMediaStream.getAudioTracks()[0].enabled =
                                        false;
                                    setAudioEnabled(false);
                                } else {
                                    myMediaStream.getAudioTracks()[0].enabled =
                                        true;
                                    setAudioEnabled(true);
                                }
                            }
                        }}
                        size="icon"
                        className={cn(
                            "rounded-full w-12 h-12 text-xl",
                            audioEnabled
                                ? "bg-inherit"
                                : "bg-red-500 hover:bg-red-700 text-white"
                        )}>
                        {audioEnabled ? (
                            <FaMicrophoneAlt />
                        ) : (
                            <FaMicrophoneLinesSlash />
                        )}
                    </Button>
                    <Button
                        size="icon"
                        className="rounded-full w-12 h-12 text-xl">
                        <HiUserAdd />
                    </Button>
                    <Button
                        onClick={handleChatBoxPanel}
                        size="icon"
                        className="rounded-full w-12 h-12 text-xl">
                        <BsChatSquareDotsFill />
                    </Button>
                </div>
            </div>
        </div>
    );
}
