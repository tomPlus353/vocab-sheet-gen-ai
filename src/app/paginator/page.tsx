"use client";

import { useState, useEffect } from "react";
import Paginator from "./_components/Paginator";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/common/PageContainer";

function PaginatePage() {
  const [textArray, setTextArray] = useState<string[]>([]);
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
    } catch (error) {
      console.error("error when parsing textArray from local storage", error);
    }
  }, []);

  const paginatorProps = {
    allText: textArray,
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
