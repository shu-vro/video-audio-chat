"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import { FaVideo, FaVideoSlash, FaMicrophoneLinesSlash } from "react-icons/fa6";
import { MdCallEnd } from "react-icons/md";
import { FaMicrophoneAlt } from "react-icons/fa";
import { BsChatSquareDotsFill } from "react-icons/bs";
import { HiUserAdd } from "react-icons/hi";
import { cn } from "@/lib/utils";
import { PeerType } from "@/types/peer-types";

function Video({ peer }: { peer: PeerType }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [streamReady, setStreamReady] = useState(false);

    useEffect(() => {
        peer.peer.on("stream", (stream) => {
            setStreamReady(true);
            videoRef.current!.srcObject = stream;
            videoRef.current!.autoplay = true;
        });
    }, []);
    return (
        <div
            id={peer.uniqueId}
            className={cn(
                "relative w-[calc(50%-12px)] h-1/2 border-cyan-400 border border-solid",
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
            <VideoTitleChip>{peer.name}</VideoTitleChip>
        </div>
    );
}

function VideoTitleChip({ children }: { children: React.ReactNode }) {
    return (
        <span className="absolute bottom-0 right-0 text-lg bg-foreground/25 text-white px-2 py-1 rounded-ss-md">
            {children}
        </span>
    );
}

export default function VideoPanel({
    sender_name,
    roomId,
    handleChatBoxPanel,
    peers,
    myMediaStream,
    onRoomExit,
}: {
    sender_name: string;
    roomId: string;
    handleChatBoxPanel: () => void;
    peers: PeerType[];
    myMediaStream?: MediaStream;
    onRoomExit: () => void;
}) {
    const [videoEnabled, setVideoEnabled] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const my_video_ref = useRef<HTMLVideoElement>(null);

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
                <div className="relative w-[calc(50%-12px)] h-1/2 border-cyan-400 border border-solid">
                    <video
                        src=""
                        className="w-full h-full"
                        style={{
                            transform: "rotateY(180deg)",
                        }}
                        ref={my_video_ref}></video>

                    <VideoTitleChip>{sender_name}</VideoTitleChip>
                </div>
                {peers.map((peer, i) => (
                    <Video key={i} peer={peer} />
                ))}
            </div>
            <div className="h-16 w-full grid place-items-center">
                <div className="bg-neutral-400 dark:bg-neutral-500 flex gap-4 rounded-full px-3 py-1">
                    <Button
                        size="icon"
                        onClick={onRoomExit}
                        className="rounded-full w-12 h-12 text-xl bg-red-500 text-white hover:bg-red-700">
                        <MdCallEnd />
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
