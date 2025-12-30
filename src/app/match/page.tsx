"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import CommonButton from "@/components/common/CommonButton";
import { getHashedCache, setHashedCache } from "@/lib/utils";

import SectionHeader from "@/components/common/SectionHeader";

import { Toaster } from "@/components/ui/toaster";
import type { JsonArray } from "@prisma/client/runtime/library";
import { sleep } from "@trpc/server/unstable-core-do-not-import";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader } from "./_components/Loader";
import { useKeyboardShortcut } from "@/hooks/use-key-shortcut";

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
    //game state
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
    const [roundsArray, setRoundsArray] = useState<string[]>([]);
    const [totalRounds, setTotalRounds] = useState<number>(1);

    //User Settings
    const [isHideReading, setIsHideReading] = useState<boolean>(false);
    const [isTestReading, setIsTestReading] = useState<boolean>(false);
    const [round, setRound] = useState<string>("1");
    const MIN_LAST_ROUND_TERMS = 3; //minimum terms in last round, does not affect games with a single round

    // constant settings
    const termsPerRound = 5;

    /* 
    HANDLE KEYBOARD SHORTCUTS
    */
    useKeyboardShortcut({
        key: "Enter",
        onKeyPressed: () => {
            console.log("Restarting game... round is: ", round);
            startGame().catch((err) => {
                console.error("Error restarting game: ", err);
            });
        },
        dependencies: [round],
    });

    useKeyboardShortcut({
        key: "ArrowLeft",
        onKeyPressed: () => {
            console.log("Changing round with left arrow... round is: ", round);
            if (Number(round) > 1) {
                handleRoundChange(Math.max(1, Number(round) - 1).toString());
            }
        },
        dependencies: [round],
    });

    useKeyboardShortcut({
        key: "ArrowRight",
        onKeyPressed: () => {
            if (Number(round) < totalRounds) {
                console.log(
                    "Changing round with right arrow... round is: ",
                    round,
                );
                handleRoundChange(Math.max(1, Number(round) + 1).toString());
            } else {
                console.log("At last round, cannot go further.");
            }
        },
        dependencies: [round],
    });

    //shortcuts for selecting cards a-z (1-26)
    for (let i = 1; i <= 26; i++) {
        //convert to letter key
        const letter = String.fromCharCode(97 + i - 1);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useKeyboardShortcut({
            key: letter,
            onKeyPressed: () => {
                console.log("Selecting ", i);
                handleSelection(i); //plus one to target the term
            },
            dependencies: [selected1, selected2],
        });
    }

    /* 
    END KEYBOARD SHORTCUTS
    */

    //start or restart the game
    async function startGame(currentRound: string = round) {
        // set/reset game state
        setIsLoading(true);
        setScore(0);
        setSelected1(0);
        setSelected2(0);
        setAnswered([]);
        setLatestCorrectAnw([]);
        setTimer(0);
        setIsGameOver(false);

        const activeTextStr = localStorage.getItem("activeText");
        if (!activeTextStr) {
            alert("No active text found. Please select a text first.");
            setIsLoading(false);
            return;
        }

        //initialize empty reply from cache or llm
        let reply: string | undefined = "";

        const cachedJsonString = getHashedCache("vocabGame" + activeTextStr);
        if (cachedJsonString) {
            reply = cachedJsonString;
        } else {
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

            //get the reply
            reply = jsonResponse?.jsonMarkdownString;

            //handle http errors
            if (responseCode !== 200 || !reply) {
                console.log(reply);
                setIsLoading(false);
                alert(
                    "Server Error: LLM could not generate the game." +
                        "\nStatus code: " +
                        responseCode +
                        "\nResponse: " +
                        (reply ?? "Empty response"),
                );
                return;
            }
            //cache the request using hash of activeText
            setHashedCache("vocabGame" + activeTextStr, reply);
        }

        //handle success
        console.log("json string reply", reply);

        const replyJson = JSON.parse(reply) as JsonArray;

        // Calculate total number of rounds, array of rounds
        // and select terms for the current round
        const roundIndex = Number(currentRound) - 1; // convert round index to zero based
        console.log("roundIndex: ", roundIndex);

        const lastRoundTerms = replyJson.length % termsPerRound;
        let termsForGame: JsonArray = [];
        if (lastRoundTerms > 0 && lastRoundTerms < MIN_LAST_ROUND_TERMS) {
            const offsetTotalRounds =
                Math.ceil(replyJson.length / termsPerRound) - 1;
            setTotalRounds(offsetTotalRounds);
            console.log("totalRounds: ", totalRounds);

            // create rounds array for the select dropdown
            setRoundsArray(
                Array.from({ length: totalRounds }, (_, i) =>
                    (i + 1).toString(),
                ),
            );

            if (roundIndex + 1 === totalRounds) {
                //set terms if last round is selected
                termsForGame = replyJson.slice(
                    roundIndex * termsPerRound,
                    undefined,
                );
                //note: includes all remaining terms, even if over the term limit
                //this is to avoid rounds with too few terms
                //e.g. if termsPerRound is 5, and there are 12 terms remaining, the last round will have 7 terms, not 5
            } else {
                //set terms for other rounds
                termsForGame = replyJson.slice(
                    roundIndex * termsPerRound,
                    (roundIndex + 1) * termsPerRound,
                );
            }
            console.log("termsForGame: ", termsForGame);
        } else {
            setTotalRounds(Math.ceil(replyJson.length / termsPerRound));
            console.log("totalRounds: ", totalRounds);
            setRoundsArray(
                Array.from({ length: totalRounds }, (_, i) =>
                    (i + 1).toString(),
                ),
            );
            termsForGame = replyJson.slice(
                roundIndex * termsPerRound,
                (roundIndex + 1) * termsPerRound,
            );
            console.log("termsForGame: ", termsForGame);
        }

        // generate two cards of each term, one for front and one for back
        const front: vocabObj[] = termsForGame.map((obj) => ({
            ...(obj as vocabObj),
            type: "front",
        }));
        const back: vocabObj[] = termsForGame.map((obj) => ({
            ...(obj as vocabObj),
            type: "back",
        }));
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

        setIsLoading(false);
    }

    function handleRoundChange(value: string) {
        console.log("Round changing to ", value, "Total rounds: ", totalRounds);
        setRound(value);
        console.log("Changing round, round is: ", round);
        //restart the game with new round, while catching any errors and indicating to the user
        startGame(value).catch((err) => {
            const errorMessage =
                err instanceof Error ? err.message : String(err);

            console.error("Error starting game: ", errorMessage);
            alert("Error starting game: " + errorMessage);
        });
    }

    function handleSelection(id: number) {
        //if the button is already selected, deselect it
        if (selected1 === id) {
            setSelected1(0);
            return;
        }
        if (selected2 === id) {
            setSelected2(0);
            return;
        }
        // console.log("clicked id: ", id);

        //if no selection yet, set selected1
        if (!selected1 && !selected2) {
            setSelected1(id);
        }

        //if selected1 is set, set selected2
        if (selected1) {
            setSelected2(id);
            // console.log("selected1: ", selected1, " selected2: ", selected2);
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
            //hide the button and remove the space
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

    function computeRoundButtonStyle(direction: "prev" | "next") {
        // base style
        let buttonStyle =
            "mx-1 p-1 bg-indigo-600 shadow-md focus-within:outline-indigo-600 text-white";
        // add invisible class if at first or last round
        if (direction === "prev" && Number(round) <= 1) {
            buttonStyle += " invisible";
        }
        if (direction === "next" && Number(round) >= totalRounds) {
            buttonStyle += " invisible";
        }
        return buttonStyle;
    }

    function computeLabel(id: number): string {
        let label = "";
        const idAsLetter = String.fromCharCode(97 + id); //convert to letter a-z
        if (gameVocabJson.length > 0) {
            //get the term object
            const termObj = gameVocabJson[id];
            //check if the termObj is defined and has a type property, then check if it is front or back
            if (termObj?.type === "front") {
                if (isHideReading || isTestReading) {
                    label = `${idAsLetter}. ${termObj?.japanese}`;
                } else {
                    label = `${idAsLetter}. ${termObj?.japanese}(${termObj?.romanization})`;
                }
            } else if (termObj?.type === "back") {
                if (isTestReading) {
                    label = `${idAsLetter}. ${termObj?.romanization}`;
                } else {
                    label = termObj?.english_definition
                        ? `${idAsLetter}. ${termObj.english_definition}`
                        : "undefined";
                }
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
                const label1 = computeLabel(selected1);
                const label2 = computeLabel(selected2);
                toast({
                    title: "Correct Match!",
                    description: `${label1} == ${label2}`,
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
                const label1 = computeLabel(selected1);
                const label2 = computeLabel(selected2);
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
                duration: 2000,
                variant: "default",
            });
        }
    }, [answered]);

    //timer
    useEffect(() => {
        //increment timer every second after game starts until game is over
        if (!isLoading && !isGameOver) {
            const interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer, isGameOver, isLoading]);

    const router = useRouter();
    return (
        <div>
            <SectionHeader title={"Matching Game"} />
            <div className="flex flex-wrap justify-start">
                <CommonButton
                    //emoji for going back
                    label={"↩ Back to Ereader"}
                    onClick={() => router.back()}
                />
                <CommonButton
                    //emoji for going back
                    label={"⟳ Play Again"}
                    onClick={() => startGame()}
                />
                <div className="mr-auto flex items-center gap-1 text-lg">
                    <Checkbox
                        className="border-indigo-800 bg-gray-200 data-[state=checked]:bg-indigo-900"
                        id="hide-reading"
                        checked={isHideReading}
                        onCheckedChange={() =>
                            setIsHideReading(isHideReading ? false : true)
                        }
                    ></Checkbox>
                    <Label
                        htmlFor="hide-reading"
                        className="cursor-pointer text-lg"
                    >
                        <p>Hide Reading</p>
                    </Label>
                </div>

                <div className="mr-auto flex items-center gap-1 text-lg">
                    <Checkbox
                        className="border-indigo-800 bg-gray-200 data-[state=checked]:bg-indigo-900"
                        id="test-reading"
                        checked={isTestReading}
                        onCheckedChange={() =>
                            setIsTestReading(isTestReading ? false : true)
                        }
                    ></Checkbox>
                    <Label
                        htmlFor="test-reading"
                        className="cursor-pointer text-lg"
                    >
                        <p>Test Reading</p>
                    </Label>
                </div>
                {/* row changing UI */}
                <div className="flex flex-row">
                    <CommonButton
                        label={"<"}
                        additionalclasses={
                            computeRoundButtonStyle("prev") ?? "invisible"
                        }
                        onClick={() =>
                            handleRoundChange(
                                Math.max(1, Number(round) - 1).toString(),
                            )
                        }
                    />
                    <div className="mr-auto flex flex-col items-start gap-1 text-lg">
                        <Label className="mb-1" htmlFor="round-select">
                            Round
                        </Label>
                        <Select value={round} onValueChange={handleRoundChange}>
                            <SelectTrigger
                                id="round-select"
                                className="mb-2 bg-black text-white shadow-md focus-within:outline-none"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 text-white">
                                {roundsArray.map((value) => (
                                    <SelectItem
                                        key={value}
                                        value={value}
                                        className={`hover:bg-grey-100 hover:font-bold focus:font-bold ${round === value ? "font-bold" : ""}`}
                                    >
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <CommonButton
                        label={">"}
                        additionalclasses={
                            computeRoundButtonStyle("next") ?? "invisible"
                        }
                        onClick={() =>
                            handleRoundChange(
                                Math.max(1, Number(round) + 1).toString(),
                            )
                        }
                    />
                </div>
            </div>
            {/* Stats row */}
            <div className="mx-12 flex flex-row justify-between">
                <p className="text-lg font-semibold text-blue-300">
                    {" "}
                    {`Score: ${score}/${gameVocabJson.length / 2}`}
                </p>
                <p className="text-lg font-semibold text-blue-300">
                    {" "}
                    {`Round: ${round}/${totalRounds}`}
                </p>
                <p className="text-lg font-semibold text-blue-300">
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
                                        key={zeroIndex}
                                        label={computeLabel(zeroIndex)} //get the label from the json object which starts at 0
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
                                        key={zeroIndex}
                                        label={computeLabel(zeroIndex)} //get the label from the json object which starts at 0
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
                <Loader />
            )}
            <Toaster />
        </div>
    );
}
