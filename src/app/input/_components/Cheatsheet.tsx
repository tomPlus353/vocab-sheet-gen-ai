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
      }).then((res) => res.text());
    }
    fetchData();
  }, []);

  return <p>{sheetContent}</p>;
}

export default CheatSheet;
