"use client";

import { useState, useEffect } from "react";
import Paginator from "./_components/Paginator";
import { useRouter } from "next/navigation";

function PaginatePage() {
    const [textArray, setTextArray] = useState<string[]>([]);
    const [numSentences, setNumSentences] = useState<string>("5");
    const router = useRouter();

    useEffect(() => {
        console.log("Paginator page use effect ran on mount");
        // Retrieve textArray from local storage during mounting
        const textArrayString = localStorage.getItem("textArray") ?? "[]";
        if (!textArrayString) {
            alert("Please input text first before using the ereader.");
            console.error("Please input text first before using the ereader.");
            router.push("/input");
        }
        try {
            setTextArray(JSON.parse(textArrayString) as unknown as string[]);
            setNumSentences(localStorage.getItem("numSentences") ?? "5");
        } catch (error) {
            console.error("Error when parsing data from local storage", error);
        }
    }, []);

    const paginatorProps = {
        allText: textArray,
        numSentences: numSentences,
    };

    return <Paginator {...paginatorProps} />;
}

export default PaginatePage;
