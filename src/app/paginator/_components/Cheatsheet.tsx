"use client"; // Important for client-side components

import React, {
    useState,
    useEffect,
    useRef,
} from "react";
import { getHashedCache, setHashedCache } from "@/lib/utils";

interface CheatSheetProps {
    activeText: string;
    mode: string;
    signal: number;
}

const inFlightCheatSheetRequests = new Map<string, Promise<string>>();

export function loadCheatSheet(
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setSheetContent: React.Dispatch<React.SetStateAction<string>>,
    props: CheatSheetProps,
    isRefresh: boolean,
) {
    async function fetchData(isRefresh: boolean): Promise<void> {
        //set loading while waiting
        setIsLoading(true);
        const cacheKey = props.mode + props.activeText;

        //check if the request has been cached
        const cachedResponse = getHashedCache(cacheKey);

        //if cached content exists and not an explicit refresh, use the cache
        if (cachedResponse && !isRefresh) {
            setSheetContent(cachedResponse);
            setIsLoading(false);
            return;
        }

        const existingRequest = inFlightCheatSheetRequests.get(cacheKey);
        if (existingRequest) {
            try {
                const reply = await existingRequest;
                setSheetContent(reply);
            } catch (error) {
                console.log(error);
                setSheetContent("Error when fetching data from the llm");
            } finally {
                setIsLoading(false);
            }
            return;
        }

        const requestPromise = (async (): Promise<string> => {
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
            if (responseCode !== 200) {
                throw new Error("Error when fetching data from the llm");
            }

            //handle success
            const reply: string | undefined | null =
                jsonResponse?.htmlMarkdownString;
            if (!reply) {
                throw new Error("Error when fetching data from the llm");
            }
            return reply;
        })();

        inFlightCheatSheetRequests.set(cacheKey, requestPromise);
        try {
            const reply = await requestPromise;
            setSheetContent(reply);
            //cache the request using hash of activeText
            setHashedCache(cacheKey, reply);
        } catch (error) {
            console.log(error);
            setSheetContent("Error when fetching data from the llm");
        } finally {
            inFlightCheatSheetRequests.delete(cacheKey);
            setIsLoading(false);
        }

    }

    //fetch data if rendering on the client only
    if (typeof window !== "undefined") {
        fetchData(isRefresh).catch(console.error);
    }
}

export function CheatSheet(props: CheatSheetProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [sheetContent, setSheetContent] = useState("");
    const hasMountedRef = useRef(false);

    // fetch on first render and whenever text/mode changes
    useEffect(() => {
        loadCheatSheet(setIsLoading, setSheetContent, props, false);
    }, [props.activeText, props.mode]);

    // monitor refresh signal, but skip initial mount
    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            return;
        }
        loadCheatSheet(setIsLoading, setSheetContent, props, true);
    }, [props.signal]);

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
