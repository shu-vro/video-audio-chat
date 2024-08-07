"use client";

import { nanoid } from "nanoid";
import { createContext, useContext, useState } from "react";

const URLContext = createContext({} as ContextType);

type ContextType = {
    url: string;
    setUrl: React.Dispatch<React.SetStateAction<ContextType["url"]>>;
    groupName: string;
    setGroupName: React.Dispatch<
        React.SetStateAction<ContextType["groupName"]>
    >;
    yourName: string;
    setYourName: React.Dispatch<React.SetStateAction<ContextType["yourName"]>>;
};

export function useGroupUrl() {
    return useContext(URLContext);
}

export default function GroupUrlContext({
    children,
}: {
    children: React.ReactNode;
}) {
    const [url, setUrl] = useState(
        `${globalThis?.location ? location.origin : ""}/${nanoid(10)}`
    );
    const [groupName, setGroupName] = useState("");
    const [yourName, setYourName] = useState("");
    return (
        <URLContext.Provider
            value={{
                url,
                setUrl,
                groupName,
                setGroupName,
                yourName,
                setYourName,
            }}>
            {children}
        </URLContext.Provider>
    );
}
