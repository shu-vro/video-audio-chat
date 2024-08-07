"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function JoinRoom() {
    const { push } = useRouter();
    const [yourName, setYourName] = useState("");
    const [groupURL, setGroupURL] = useState("");
    const spitted = groupURL.split("/");
    const goto_url =
        (spitted[spitted.length - 1] || "/") + `?my_name=${yourName}`;
    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                push(goto_url);
            }}>
            <CardContent className="space-y-2">
                <div className="space-y-1">
                    <Label htmlFor="current">Room URL or id</Label>
                    <Input
                        value={groupURL}
                        onChange={e => {
                            setGroupURL(e.target.value);
                        }}
                        type="text"
                        required
                        placeholder={"eg: <site-url>/ibYOB5-aPo or /ibYOB5-aPo"}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                        id="name"
                        placeholder="Your name"
                        value={yourName}
                        required
                        onChange={e => {
                            setYourName(e.target.value);
                        }}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit">Join Room</Button>
            </CardFooter>
        </form>
    );
}
