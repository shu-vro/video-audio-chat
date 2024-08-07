"use client";

import React, { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IoCopyOutline } from "react-icons/io5";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";

export default function CreateRoom() {
    const [yourName, setYourName] = useState("");
    const { push } = useRouter();
    const url = `${globalThis?.location ? location.origin : ""}/${nanoid(10)}`;
    const spitted = url.split("/");
    const goto_url =
        (spitted[spitted.length - 1] || "/") + `?my_name=${yourName}`;
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                push(goto_url);
            }}>
            <CardContent className="space-y-2">
                <div className="space-y-1">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                        required
                        placeholder="Your name"
                        value={yourName}
                        onChange={(e) => {
                            setYourName(e.target.value);
                        }}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="username">URL</Label>
                    <div className="flex flex-row gap-2 flex-nowrap">
                        <Input id="URL" readOnly defaultValue={url} required />
                        <Button
                            type="button"
                            size="icon"
                            onClick={() => {
                                navigator.clipboard.writeText(url);
                            }}>
                            <IoCopyOutline />
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit">Create Room</Button>
            </CardFooter>
        </form>
    );
}
