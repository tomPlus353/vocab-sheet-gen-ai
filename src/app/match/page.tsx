"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CommonButton from "@/components/common/CommonButton";

import * as React from "react";
import SectionHeader from "@/components/common/SectionHeader";
import PageContainer from "@/components/common/PageContainer";

export default function Match() {
  const [selected1, setSelected1] = useState(0);
  const [selected2, setSelected2] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  async function startGame() {
    setIsLoading(true);
    const activeTextStr = localStorage.getItem("activeText");

    //prompt the llm
    const response: Response = await fetch("/api/llm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "force-cache",
      body: JSON.stringify({
        text: activeTextStr,
        mode: "vocabGame",
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
      const resText = await response.text();
      console.log(resText);
      setIsLoading(false);
      return;
    }

    //handle empty reply
    const reply: string | undefined | null = jsonResponse?.htmlMarkdownString;
    if (!reply) {
      setIsLoading(false);
      alert("Server Error: LLM could not generate the game");
      return;
    }

    //handle success

    console.debug(reply);

    setIsLoading(false);
  }

  function handleSelection(id: number) {
    console.log("clicked id: ", id);
    if (selected1 && selected2) {
      setSelected1(0);
      setSelected2(0);
    }
    if (selected1) {
      setSelected2(id);
      return;
    } else {
      setSelected1(id);
    }
  }
  function computeSelectStyle(id: number) {
    const selectedStyle =
      "bg-amber-500 text-black font-bold hover:bg-amber-500";
    if (id === selected1 || id === selected2) {
      return selectedStyle;
    }
    return "";
  }

  useEffect(() => {
    console.log("use effect triggered for selected card");
  }, [selected1, selected2]);
  const router = useRouter();
  return (
    <PageContainer>
      <SectionHeader title={"Matching Game"} />
      <CommonButton
        additionalclasses="align-start mr-auto"
        //emoji for going back
        label={"↩ Back to Ereader"}
        onClick={() => router.back()}
      />
      <CommonButton
        additionalclasses="align-start mr-auto"
        //emoji for going back
        label={"↩ Play Again"}
        onClick={() => startGame()}
      />
      <div className="m-auto grid grid-cols-3 lg:w-[80%]">
        {/* <div className="m-auto flex flex-row lg:w-[80%]"> */}
        {Array.from({ length: 10 }, (_, id) => id + 1).map((value, _index) => (
          <CommonButton
            key={value}
            label={value}
            additionalclasses={computeSelectStyle(value) ?? ""}
            onClick={() => handleSelection(value)}
          />
        ))}
      </div>
    </PageContainer>
  );
}
