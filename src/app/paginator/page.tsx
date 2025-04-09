"use client";

import { useState, useEffect } from "react";
import Paginator from "./_components/Paginator";
import Router from "next/router";

function PaginatePage() {
  const [textArray, setTextArray] = useState<string[]>([]);

  useEffect(() => {
    // Retrieve textArray from local storage during mounting
    const textArrayString = localStorage.getItem("textArray") ?? "[]";
    if (!textArrayString) {
      alert("Please input text first before using the ereader.");
      console.error("Please input text first before using the ereader.");
      Router.push("/input").catch((error) => {
        console.error(error);
      });
    }
    try {
      setTextArray(JSON.parse(textArrayString) as unknown as string[]);
    } catch (error) {
      console.error("error when parsing textArray from local storage", error);
    }
  }, []);

  const paginatorProps = {
    allText: textArray,
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* ... other content ... */}
      <Paginator {...paginatorProps} />
    </div>
  );
}

export default PaginatePage;
