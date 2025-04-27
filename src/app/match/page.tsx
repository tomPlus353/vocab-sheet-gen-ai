"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import CommonButton from "@/components/common/CommonButton";

import * as React from "react";
import SectionHeader from "@/components/common/SectionHeader";
import PageContainer from "@/components/common/PageContainer";
import { Toaster } from "@/components/ui/toaster";
import type { JsonArray } from "@prisma/client/runtime/library";
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
    const [latestCorrectAnw, setLatestCorrectAnw] = useState<number[]>([]);
    const [gameVocabJson, setGameVocabJson] = useState<vocabObj[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const { toast } = useToast();

    //start or restart the game
    async function startGame() {
        setIsLoading(true);
        setScore(0);
        setSelected1(0);
        setSelected2(0);
        setAnswered([]);
        setLatestCorrectAnw([]);
        setTimer(0);

        const activeTextStr = localStorage.getItem("activeText");
        if (!activeTextStr) {
            alert("No active text found. Please select a text first.");
            setIsLoading(false);
            return;
        }

        if (gameVocabJson.length === 0) {
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

            //handle empty reply
            const reply: string | undefined | null =
                jsonResponse?.jsonMarkdownString;

            //handle http errors
            if (responseCode !== 200 || !reply) {
                const resText = await response.text();
                console.log(resText);
                setIsLoading(false);
                alert("Server Error: LLM could not generate the game");
                return;
            }

            //handle success
            console.log("json string reply", reply);
            const front: vocabObj[] = (JSON.parse(reply) as JsonArray).map(
                (obj) => ({
                    ...(obj as vocabObj),
                    type: "front",
                }),
            );
            const back: vocabObj[] = (JSON.parse(reply) as JsonArray).map(
                (obj) => ({
                    ...(obj as vocabObj),
                    type: "back",
                }),
            );
            const frontShuffled = shuffleArray(front);
            const backShuffled = shuffleArray(back);
            const joinedArray: vocabObj[] = [];
            Array.from({ length: frontShuffled.length }, (_, id) => id).forEach(
                (i: number) => {
                    joinedArray.push(frontShuffled[i]!);
                    joinedArray.push(backShuffled[i]!);
                },
            );
            console.log("joined array: ", joinedArray);
            //sort random
            setGameVocabJson(joinedArray);
            //[...frontShuffled, ...backShuffled]);
        }
        setIsLoading(false);
    }

    function handleSelection(id: number) {
        //if the button is already selected, do nothing
        if (selected1 === id || selected2 === id) {
            return;
        }
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
        //turn buttons green briefly after correct answer
        if (latestCorrectAnw.includes(id)) {
            selectedStyle =
                "bg-green-500 text-black font-bold hover:bg-green-500";
            return selectedStyle;
        }

        //todo: mark red if wrong answer

        //hide if already answered but keep the space
        if (answered.includes(id)) {
            //make the button invisible but keep its space
            selectedStyle = "invisible";
            return selectedStyle;
        }
        //mark amber if button is selected
        if (id === selected1 || id === selected2) {
            //check for correct answer
            selectedStyle =
                "bg-amber-500 text-black font-bold hover:bg-amber-500";
            return selectedStyle;
        }
        return selectedStyle;
    }

    function computeLabel(id: number): string {
        let label = "";
        if (gameVocabJson.length > 0) {
            const termObj = gameVocabJson[id];
            //check if the termObj is defined and has a type property
            if (termObj?.type === "front") {
                label = `${termObj?.japanese}(${termObj?.romanization})`;
                if (!label.includes("(")) {
                    label = `${label}(${termObj?.romanization})`;
                }
            } else if (termObj?.type === "back") {
                // const label: string = termObj?.english ?? "undefined";
                label = termObj?.english_definition ?? "undefined";
            }
        }
        return label;
    }

    function computeIsDisabled(): boolean {
        return latestCorrectAnw.length !== 0;
    }

    //start the game when the page loads
    useEffect(() => {
        startGame().catch((err) => {
            console.error("Error starting game: ", err);
        });
    }, []);

    //called when user selects a card
    //check if both cards are the same
    useEffect(() => {
        console.log("use effect triggered for selected card");
        if (selected1 && selected2) {
            const selectedObj1 = gameVocabJson[selected1 - 1];
            const selectedObj2 = gameVocabJson[selected2 - 1];
            //check if the selected objects are the same
            if (selectedObj1?.japanese === selectedObj2?.japanese) {
                setAnswered((prevAnswered) => [
                    ...prevAnswered,
                    selected1,
                    selected2,
                ]);
                setScore((prevScore) => prevScore + 1);
                setLatestCorrectAnw([selected1, selected2]);
                //show succcess to the user
                console.log("answered1: ", answered.length);
                console.log("gameVocabJson1: ", gameVocabJson.length);
                const label1 = computeLabel(selected1 - 1);
                const label2 = computeLabel(selected2 - 1);
                toast({
                    title: "Correct Match!",
                    description: `You matched ${label1} with ${label2}`,
                    duration: 1500,
                    variant: "success",
                });
                sleep(10)
                    .then(() => {
                        setSelected1(0);
                        setSelected2(0);
                        setLatestCorrectAnw([]);
                    })
                    .catch((err) => {
                        console.error("Error in sleep: ", err);
                    });
            } else {
                const label1 = computeLabel(selected1 - 1);
                const label2 = computeLabel(selected2 - 1);
                toast({
                    title: "Incorrect Match!",
                    description: `You matched ${label1} with ${label2}`,
                    duration: 1500,
                    variant: "destructive",
                });
                setSelected1(0);
                setSelected2(0);
            }
        }
    }, [selected1, selected2]);

    //track answered with use effect to check if game is over
    useEffect(() => {
        //check if game is over
        console.log("answered2: ", answered.length);
        console.log("gameVocabJson2: ", gameVocabJson.length);
        if (
            answered.length === gameVocabJson.length &&
            gameVocabJson.length > 0 &&
            !isGameOver
        ) {
            const finalTime = timer; //cache final time
            setIsGameOver(true);
            toast({
                title: "Game Over!",
                description: `You finished the game with a score of ${score}/${gameVocabJson.length / 2} in ${finalTime} seconds`,
                duration: 5000,
                variant: "default",
            });
        }
    }, [answered]);

    //timer
    useEffect(() => {
        //increment timer every second
        if (isGameOver === false) {
            const interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer, isGameOver]);

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
                    {`Time: ${timer}`}
                </p>
            </div>
            {!isLoading ? (
                <div>
                    <div className="m-auto grid grid-cols-2 lg:w-[80%]">
                        {/* col 1 */}
                        <div>
                            {Array.from(
                                {
                                    length: gameVocabJson.length,
                                },
                                (_, id) => id + 1,
                            ).map((oneIndex, zeroIndex) =>
                                gameVocabJson[zeroIndex]?.type === "front" ? (
                                    <CommonButton
                                        key={oneIndex - 1}
                                        label={computeLabel(oneIndex - 1)} //get the label from the json object which starts at 0
                                        additionalclasses={
                                            computeSelectStyle(oneIndex) ?? ""
                                        } //plus one to target the term
                                        isTempDisabled={computeIsDisabled()}
                                        onClick={() =>
                                            handleSelection(oneIndex)
                                        } //plus one to target the term
                                    />
                                ) : (
                                    ""
                                ),
                            )}
                        </div>
                        {/* col 2 */}
                        <div>
                            {Array.from(
                                {
                                    length: gameVocabJson.length,
                                },
                                (_, id) => id + 1,
                            ).map((oneIndex, zeroIndex) =>
                                gameVocabJson[zeroIndex]?.type === "back" ? (
                                    <CommonButton
                                        key={oneIndex - 1}
                                        label={computeLabel(oneIndex - 1)} //get the label from the json object which starts at 0
                                        additionalclasses={
                                            computeSelectStyle(oneIndex) ?? ""
                                        } //plus one to target the term
                                        isTempDisabled={computeIsDisabled()}
                                        onClick={() =>
                                            handleSelection(oneIndex)
                                        } //plus one to target the term
                                    />
                                ) : (
                                    ""
                                ),
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-20 w-20 animate-spin self-center rounded-full border-4 border-gray-200 border-t-blue-500 text-center"></div>
            )}
            <Toaster />
        </PageContainer>
    );
}
