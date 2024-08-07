"use client";

import { useState, useEffect } from "react";

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const updateMatches = () => {
            const mediaQueryList = window.matchMedia(query);
            setMatches(mediaQueryList.matches);
        };

        updateMatches();
        window.addEventListener("resize", updateMatches);
        return () => {
            window.removeEventListener("resize", updateMatches);
        };
    }, [query]);

    return matches;
};

export default useMediaQuery;
