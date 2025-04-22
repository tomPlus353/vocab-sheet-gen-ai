"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import CommonButton from "@/components/common/CommonButton";

import * as React from "react";
import SectionHeader from "@/components/common/SectionHeader";
import PageContainer from "@/components/common/PageContainer";
import { Toaster } from "@/components/ui/toaster";
import { JsonArray } from "@prisma/client/runtime/library";
import { sleep } from "@trpc/server/unstable-core-do-not-import";

type vocabObj = Record<string, string>;

//fischer y-yates shuffle
function shuffleArray(vocabArray: vocabObj[]) {
  if (vocabArray.length === 0) {
    return vocabArray;
  }
  for (let m = vocabArray.length - 1; m > 0; m--) {
    const j = Math.floor(Math.random() * (m + 1));
    const t = vocabArray[m];
    if (vocabArray[j]) {
      vocabArray[m] = vocabArray[j];
    }
    if (t) {
      vocabArray[j] = t;
    }
  }
  return vocabArray;
}

export default function Match() {
  const [selected1, setSelected1] = useState(0);
  const [selected2, setSelected2] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number[]>([]);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [gameVocabJson, setGameVocabJson] = useState<vocabObj[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  async function startGame() {
    setIsLoading(true);
    setScore(0);
    setSelected1(0);
    setSelected2(0);

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
    //console.log(JSON.stringify(jsonResponse));

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
    const reply: string | undefined | null = jsonResponse?.jsonMarkdownString;
    if (!reply) {
      setIsLoading(false);
      alert("Server Error: LLM could not generate the game");
      return;
    }

    //handle success
    console.log("json string reply", reply);
    const front: vocabObj[] = (JSON.parse(reply) as JsonArray).map((obj) => ({
      ...(obj as vocabObj),
      type: "front",
    }));
    const back: vocabObj[] = (JSON.parse(reply) as JsonArray).map((obj) => ({
      ...(obj as vocabObj),
      type: "back",
    }));
    //sort random
    setGameVocabJson(shuffleArray([...front, ...back]));

    setIsLoading(false);
  }

  function handleSelection(id: number) {
    console.log("clicked id: ", id);
    if (!selected1 && !selected2) {
      setSelected1(id);
    }
    if (selected1) {
      setSelected2(id);
      console.log("selected1: ", selected1, " selected2: ", selected2);
    }
  }

  function computeSelectStyle(id: number) {
    let selectedStyle = "";
    if (id === selected1 || id === selected2) {
      //check for correct answer
      if (isCurrentCorrect) {
        selectedStyle = "bg-green-500 text-black font-bold hover:bg-green-500";
        return selectedStyle;
      } else {
        selectedStyle = "bg-amber-500 text-black font-bold hover:bg-amber-500";
        return selectedStyle;
      }
    }
    return selectedStyle;
  }

  function computeLabel(id: number): string {
    let label = "";
    if (gameVocabJson.length > 0) {
      const termObj = gameVocabJson[id];
      //check if the termObj is defined and has a type property
      if (termObj?.type === "front") {
        label = termObj?.japanese ?? "undefined";
      } else if (termObj?.type === "back") {
        // const label: string = termObj?.english ?? "undefined";
        label = termObj?.english_definition ?? "undefined";
      }
    }
    return label;
  }

  useEffect(() => {
    console.log("use effect triggered for selected card");
    if (selected1 && selected2) {
      const selectedObj1 = gameVocabJson[selected1 - 1];
      const selectedObj2 = gameVocabJson[selected2 - 1];
      //check if the selected objects are the same
      if (selectedObj1?.japanese === selectedObj2?.japanese) {
        setIsCurrentCorrect(true);
        //show succcess to the user
        toast({
          title: "Correct Match!",
          description: `You matched ${selectedObj1?.japanese} with ${selectedObj2?.english_definition}`,
          duration: 2000,
          variant: "success",
        });
        setScore(score + 1);
        sleep(2000)
          .then(() => {
            setAnswered([...answered, selected1, selected2]);
          })
          .catch((err) => {
            console.error("Error in sleep: ", err);
          });
        setSelected1(0);
        setSelected2(0);
      } else {
        toast({
          title: "Incorrect Match!",
          description: `You matched ${selectedObj1?.japanese} with ${selectedObj2?.english_definition}`,
          duration: 2000,
          variant: "destructive",
        });
        setSelected1(0);
        setSelected2(0);
      }
    }
  }, [selected1, selected2, gameVocabJson, score]);

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
      <div className="flex flex-row md:w-[80%]">
        <p className="text-lg font-semibold text-blue-300">
          {" "}
          {`Score: ${score}/${gameVocabJson.length / 2}`}
        </p>
        <p className="ml-auto text-lg font-semibold text-blue-300">
          {" "}
          {`Time: ${score}`}
        </p>
      </div>
      {!isLoading ? (
        <div>
          <div className="m-auto grid grid-cols-3 lg:w-[80%]">
            {/* <div className="m-auto flex flex-row lg:w-[80%]"> */}
            {Array.from(
              { length: gameVocabJson.length },
              (_, id) => id + 1,
            ).map((oneIndex, zeroIndex) => (
              <CommonButton
                key={zeroIndex}
                label={computeLabel(zeroIndex)} //get the label from the json object which starts at 0
                additionalclasses={computeSelectStyle(oneIndex) ?? ""} //plus one to target the term
                onClick={() => handleSelection(oneIndex)} //plus one to target the term
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="h-20 w-20 animate-spin self-center rounded-full border-4 border-gray-200 border-t-blue-500 text-center"></div>
      )}
      <Toaster />
    </PageContainer>
  );
}
