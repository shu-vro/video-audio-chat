"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { MdSend } from "react-icons/md";
import { type Socket } from "socket.io-client";
import { toast } from "sonner";
import { RxChevronRight } from "react-icons/rx";

export type SocketEvents = {
    [x: string]: (...args: any[]) => void;
};

export default function ChatPanel({
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
    const [up_and_running, setUp_and_running] = useState(false);
    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState<MessageType[]>([]);

    useEffect(() => {
        const timeout = setInterval(() => {
            if (socket.connected) {
                setUp_and_running(true);
                toast(`Chat panel ready to go`, {
                    action: {
                        label: "Ok",
                        onClick: () => null,
                    },
                });
                clearInterval(timeout);

                socket.on(
                    "server:send_message_to_everyone",
                    (userId, sender_name, message, type, time) => {
                        setAllMessages((prev) => {
                            let x = [...prev];
                            x.push({
                                userId,
                                sender_name,
                                message,
                                time,
                                type,
                            });
                            return x;
                        });
                    }
                );

                socket.on(
                    "server:someone-joined",
                    (room_name, socket_id, joiner_name) => {
                        setAllMessages((prev) => {
                            let x = [...prev];
                            x.push({
                                userId: socket_id,
                                sender_name: "",
                                message: `${joiner_name} joined the call`,
                                time: 0,
                                type: "info",
                            });
                            return x;
                        });
                    }
                );
                socket.on("server:somebody_is_leaving", (joiner_name) => {
                    setAllMessages((prev) => {
                        let x = [...prev];
                        x.push({
                            userId: "",
                            sender_name: "",
                            message: `${joiner_name} left the call.`,
                            time: 0,
                            type: "info",
                        });
                        return x;
                    });
                });
            }
        }, 1000);

        return () => {
            if (timeout) clearTimeout(timeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <div className="w-full h-[calc(100vh-7rem)] overflow-y-auto">
                {allMessages.map((message, i) => (
                    <Message
                        key={i}
                        {...message}
                        by={message.userId === socket.id ? "me" : "him"}
                    />
                ))}
            </div>
            <form
                className="flex justify-center items-center flex-row"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (up_and_running && message.length) {
                        socket.emit(
                            "user:message_sent_to_room",
                            roomId,
                            socket.id,
                            sender_name,
                            message,
                            "message",
                            Date.now()
                        );
                    }

                    setMessage("");
                }}>
                <Button
                    size={"icon"}
                    type="button"
                    onClick={handleChatBoxPanel}>
                    <RxChevronRight className="text-3xl" />
                </Button>
                <Input
                    type="text"
                    placeholder="Write message..."
                    className="w-[90%] mx-2"
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                    }}
                />
                <Button type="submit" size={"icon"}>
                    <MdSend />
                </Button>
            </form>
        </div>
    );
}

function Message({
    by,
    message,
    sender_name,
    userId,
    type,
    time,
}: {
    by: "me" | "him";
} & MessageType) {
    return type === "message" ? (
        <div className="mb-4">
            <div
                className={cn(
                    "flex justify-center items-center",
                    by === "him" ? "flex-row" : "flex-row-reverse"
                )}>
                <div
                    className={cn(
                        "bg-cyan-300 dark:bg-cyan-700 rounded-sm px-4 w-fit mb-1 truncate",
                        by === "me" ? "ml-auto mr-2" : "mr-auto ml-2"
                    )}>
                    {sender_name}
                    <span className="opacity-55 text-xs"> - {userId}</span>
                </div>
                <div className="time text-xs">
                    {new Date(time).toLocaleString()}
                </div>
            </div>
            <div
                className={cn(
                    "bg-cyan-100 dark:bg-cyan-950 rounded-xl px-3 py-1 mx-4 w-fit",
                    by === "him" ? "text-left mr-auto" : "text-right ml-auto"
                )}>
                {message}
            </div>
        </div>
    ) : (
        <div className="mb-4 text-center text-xs opacity-70">{message}</div>
    );
}
