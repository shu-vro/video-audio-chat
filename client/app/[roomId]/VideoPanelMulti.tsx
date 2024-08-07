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
import Peer from "peerjs";
import { cn } from "@/lib/utils";

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

let peerConnections: { [x: string]: RTCPeerConnection } = {};

export default function VideoPanel({
    socket,
    sender_name,
    roomId,
    handleChatBoxPanel,
}: {
    socket: Socket<SocketEvents, SocketEvents>;
    sender_name: string;
    roomId: string;
    handleChatBoxPanel: () => void;
}) {
    const [myMediaStream, setMyMediaStream] = useState<MediaStream>();
    const [videoEnabled, setVideoEnabled] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    // const [peerConnections, setPeerConnections] = useState<{
    //     [x: string]: RTCPeerConnection;
    // }>({});
    const my_video_ref = useRef<HTMLVideoElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const second_video_ref = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                setMyMediaStream(stream);
                if (stream.getVideoTracks()[0].enabled) {
                    setVideoEnabled(true);
                }
                if (stream.getAudioTracks()[0].enabled) {
                    setAudioEnabled(true);
                }
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
    }, []);

    useEffect(() => {
        if (!my_video_ref.current || !myMediaStream) return;

        // const outerShell = document.createElement("div");
        // outerShell.className =
        //     "w-[calc(50%-12px)] h-1/2 border-cyan-400 border border-solid";
        // const remoteVideo = document.createElement("video");
        // remoteVideo.autoplay = true;
        // remoteVideo.className = "w-full h-full";
        // remoteVideo.style.transform = "rotateY(180deg)";
        // remoteVideo.srcObject = event.streams[0];

        // outerShell.appendChild(remoteVideo);

        // videoContainerRef.current!.appendChild(outerShell);

        const video = my_video_ref.current;
        video.srcObject = myMediaStream;
        video.addEventListener("loadedmetadata", () => {
            if (!video) return;
            video.play();
        });

        (async () => {
            // @ts-ignore
            const AdapterJs = await import("adapterjs");

            AdapterJs.webRTCReady(async (plugin: any) => {
                var myHostname = window.location.hostname;
                if (!myHostname) {
                    myHostname = "localhost";
                }

                // socket.on("server:rtc-offer", async (offer, senderId) => {
                //     const peerConnection = new RTCPeerConnection(
                //         configuration(myHostname)
                //     );

                //     peerConnections[senderId] = peerConnection;

                //     peerConnection.onicecandidate = (event) => {
                //         if (event.candidate) {
                //             socket.emit(
                //                 "client:rtc-candidate",
                //                 event.candidate,
                //                 roomId
                //             );
                //         }
                //     };

                //     peerConnection.ontrack = (event) => {
                //         const outerShell = document.createElement("div");
                //         outerShell.className =
                //             "w-[calc(50%-12px)] h-1/2 border-cyan-400 border border-solid";
                //         const remoteVideo = document.createElement("video");
                //         remoteVideo.autoplay = true;
                //         remoteVideo.className = "w-full h-full";
                //         remoteVideo.style.transform = "rotateY(180deg)";
                //         remoteVideo.srcObject = event.streams[0];

                //         outerShell.appendChild(remoteVideo);

                //         videoContainerRef.current!.appendChild(outerShell);
                //     };

                //     myMediaStream!.getTracks().forEach((track) => {
                //         peerConnection.addTrack(track, myMediaStream!);
                //     });

                //     await peerConnection.setRemoteDescription(
                //         new RTCSessionDescription(offer)
                //     );

                //     const answer = await peerConnection.createAnswer();
                //     await peerConnection.setLocalDescription(answer);
                //     socket.emit("client:rtc-answer", answer, roomId);
                // });

                // socket.on("server:rtc-answer", async (answer, senderId) => {
                //     console.log(senderId, "answered the call", peerConnections);
                //     await peerConnections[senderId].setRemoteDescription(
                //         new RTCSessionDescription(answer)
                //     );
                // });

                // socket.on(
                //     "server:rtc-candidate",
                //     async (candidate, senderId) => {
                //         try {
                //             await peerConnections[senderId].addIceCandidate(
                //                 new RTCIceCandidate(candidate)
                //             );
                //         } catch (e) {
                //             console.error(
                //                 "Error adding received ice candidate",
                //                 e
                //             );
                //         }
                //     }
                // );

                // // notify existing participants
                // const secondPeerConnection = new RTCPeerConnection(
                //     configuration(myHostname)
                // );
                // peerConnections[socket.id] = secondPeerConnection;

                // myMediaStream!.getTracks().forEach((track) => {
                //     secondPeerConnection.addTrack(track, myMediaStream!);
                // });

                // secondPeerConnection.onicecandidate = (event) => {
                //     if (event.candidate) {
                //         socket.emit("candidate", event.candidate, roomId);
                //     }
                // };

                // secondPeerConnection.ontrack = (event) => {
                //     const outerShell = document.createElement("div");
                //     outerShell.className =
                //         "w-[calc(50%-12px)] h-1/2 border-cyan-400 border border-solid";
                //     const remoteVideo = document.createElement("video");
                //     remoteVideo.autoplay = true;
                //     remoteVideo.className = "w-full h-full";
                //     remoteVideo.style.transform = "rotateY(180deg)";
                //     remoteVideo.srcObject = event.streams[0];

                //     outerShell.appendChild(remoteVideo);

                //     videoContainerRef.current!.appendChild(outerShell);
                // };

                // const offer = await secondPeerConnection.createOffer();
                // await secondPeerConnection.setLocalDescription(offer);

                // socket.emit("client:rtc-offer", offer, roomId);
            });
        })();

        return () => {
            if (myMediaStream) {
                myMediaStream.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        };
    }, [myMediaStream]);

    useEffect(() => {
        if (myMediaStream) {
            socket.on(
                "server:someone-joined",
                async (roomId, socketId, joiner_name) => {
                    // start an offer
                    const myPeerConnection = new RTCPeerConnection(
                        configuration(window.location.hostname)
                    );
                    peerConnections[socketId] = myPeerConnection;

                    // set my stream
                    myMediaStream.getTracks().forEach((track) => {
                        myPeerConnection.addTrack(track, myMediaStream);
                    });

                    // if received track from remote peer
                    myPeerConnection.ontrack = (event) => {
                        const outerShell = document.createElement("div");
                        outerShell.className =
                            "w-[calc(50%-12px)] h-1/2 border-cyan-400 border border-solid";
                        const remoteVideo = document.createElement("video");
                        remoteVideo.autoplay = true;
                        remoteVideo.className = "w-full h-full";
                        remoteVideo.style.transform = "rotateY(180deg)";
                        remoteVideo.srcObject = event.streams[0];

                        outerShell.appendChild(remoteVideo);

                        videoContainerRef.current!.appendChild(outerShell);
                    };

                    // if received ice candidate
                    myPeerConnection.onicecandidate = (event) => {
                        if (event.candidate) {
                            socket.emit(
                                "client:rtc-candidate",
                                event.candidate,
                                socketId
                            );
                        }
                    };
                    socket.on(
                        "server:rtc-candidate",
                        async (candidate, senderId) => {
                            try {
                                await myPeerConnection.addIceCandidate(
                                    new RTCIceCandidate(candidate)
                                );
                            } catch (e) {
                                console.error(
                                    "Error adding received ice candidate",
                                    e
                                );
                            }
                        }
                    );

                    // we send the offer
                    const offer = await myPeerConnection.createOffer();
                    await myPeerConnection.setLocalDescription(offer);
                    socket.emit("client:rtc-offer", offer, socketId);

                    // if call accepted
                    socket.on("server:rtc-answer", async (answer, senderId) => {
                        console.log("call answered");

                        await myPeerConnection.setRemoteDescription(
                            new RTCSessionDescription(answer)
                        );
                    });
                }
            );
        }
        return () => {};
    }, [myMediaStream]);

    return (
        <div className="flex flex-col gap-5 h-[calc(100vh-5rem)]">
            <div
                className="flex justify-center items-center h-[calc(100%-4rem)] w-full gap-3 flex-wrap"
                ref={videoContainerRef}>
                <div className="w-[calc(50%-12px)] h-1/2 border-cyan-400 border border-solid">
                    <video
                        src=""
                        className="w-full h-full"
                        style={{
                            transform: "rotateY(180deg)",
                        }}
                        ref={my_video_ref}></video>
                </div>
                {/* <div className="w-[calc(50%-12px)] h-1/2 border-cyan-400 border border-solid">
                    <video
                        src=""
                        className="w-full h-full"
                        style={{
                            transform: "rotateY(180deg)",
                        }}
                        ref={second_video_ref}></video>
                </div> */}
                {/* {Array(2)
                    .fill("")
                    .map((_, i) => (
                        <div
                            className="w-[calc(50%-12px)] h-1/2 border-cyan-400 border border-solid"
                            key={i}>
                            <video
                                src="https://www.pexels.com/download/video/1536322/"
                                controls
                                className="w-full h-full"></video>
                        </div>
                    ))} */}
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
