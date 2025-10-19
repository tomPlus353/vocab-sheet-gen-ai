"use client"; // Important for client-side components

import React, {
    useState,
    useEffect,
    //  Key
} from "react";
import { createHash } from "crypto";
import { getHashedCache, setHashedCache } from "@/lib/utils";

interface CheatSheetProps {
    activeText: string;
    mode: string;
    signal: number;
}

export function loadCheatSheet(
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setSheetContent: React.Dispatch<React.SetStateAction<string>>,
    props: CheatSheetProps,
    isRefresh: boolean,
) {
    async function fetchData(isRefresh: boolean): Promise<void> {
        //set loading while waiting
        setIsLoading(true);

        //check if the request has been cached
        const cachedResponse = getHashedCache(props.mode + props.activeText);

        //if cached content exists and not an explicit refresh, use the cache
        if (cachedResponse && !isRefresh) {
            setSheetContent(cachedResponse);
            setIsLoading(false);
            return;
        }

        //prompt the llm
        const response: Response = await fetch("/api/llm", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "force-cache",
            body: JSON.stringify({
                text: props.activeText,
                mode: props.mode,
            }),
        });

        //get the response
        const jsonResponse = (await response.json()) as unknown as Record<
            string,
            string
        >;
        console.log(JSON.stringify(jsonResponse));

        //get response code
        const responseCode: number = response.status;

        //handle http errors
        if (responseCode !== 200) {
            setSheetContent("Error when fetching data from the llm");
            const resText = await response.text();
            console.log(resText);
            setIsLoading(false);
            return;
        }

        //handle success
        const reply: string | undefined | null =
            jsonResponse?.htmlMarkdownString;
        if (!reply) {
            setSheetContent("Error when fetching data from the llm");
            setIsLoading(false);
            return;
        }
        setSheetContent(reply);
        setIsLoading(false);

        //cache the request using hash of activeText
        setHashedCache(props.mode + props.activeText, reply);

    }

    //fetch data if rendering on the client only
    if (typeof window !== "undefined") {
        fetchData(isRefresh).catch(console.error);
    }
}

export function CheatSheet(props: CheatSheetProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [sheetContent, setSheetContent] = useState("");

    //monitor the refresh signal
    useEffect(() => {
        loadCheatSheet(setIsLoading, setSheetContent, props, true);
    }, [props.signal]);

    useEffect(() => {
        loadCheatSheet(setIsLoading, setSheetContent, props, false);
    }, []);
    return isLoading ? (
        <div className="h-20 w-20 animate-spin self-center rounded-full border-4 border-gray-200 border-t-blue-500 text-center"></div>
    ) : (
        <div
            dangerouslySetInnerHTML={{
                __html: sheetContent,
            }}
        />
    );
}
