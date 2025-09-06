"use client";

import { useState, useEffect } from "react";
import Paginator from "./_components/Paginator";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/common/PageContainer";
import { set } from "zod";

function PaginatePage() {
  const [textArray, setTextArray] = useState<string[]>([]);
  const [numSentences, setNumSentences] = useState<string>("5");
  const router = useRouter();

  useEffect(() => {
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

  return (
    //set gradient
    <PageContainer>
      {/* ... other content ... */}
      <Paginator {...paginatorProps} />
    </PageContainer>
  );
}

export default PaginatePage;
