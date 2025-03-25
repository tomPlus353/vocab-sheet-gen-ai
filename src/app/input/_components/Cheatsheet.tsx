"use client"; // Important for client-side components

import React, { useState, useEffect, Key } from "react";

interface CheatSheetProps {
  activeText: string;
}

function CheatSheet(props: CheatSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sheetContent, setSheetContent] = useState("");
  const [currentPageHash, setCurrentPageHash] = useState("");

  useEffect(() => {
    async function fetchData(): Promise<void> {
      setIsLoading(true);
      const response: Response = await fetch("/api/llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "force-cache",
        body: JSON.stringify({ text: props.activeText }),
      });
      const jsonResponse = (await response.json()) as unknown as Record<
        string,
        string
      >;
      console.log(JSON.stringify(jsonResponse));
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
      const reply: string =
        jsonResponse?.htmlMarkdownString ?? "Error: no reply from llm";
      setSheetContent(reply);
      setIsLoading(false);
    }

    //fetch data if rendering on the client only
    if (typeof window !== "undefined") {
      fetchData().catch(console.error);
    }
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

export default CheatSheet;
