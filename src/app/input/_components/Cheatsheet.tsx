"use client"; // Important for client-side components

import React, { useState, useEffect } from "react";

interface CheatSheetProps {
  activeText: string;
}

function CheatSheet(props: CheatSheetProps) {
  const [sheetContent, setSheetContent] = useState("");

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: props.activeText }),
      });
      const jsonResponse = await response.json();
      console.log(JSON.stringify(jsonResponse));
      const reply: string = jsonResponse?.data || "Error: no reply from llm";
      setSheetContent(reply);
    }
    fetchData();
  }, []);
  return <p>{sheetContent}</p>;
}

export default CheatSheet;
