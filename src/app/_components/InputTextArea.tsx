"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/common/SectionHeader";
import CommonButton from "@/components/common/CommonButton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { Label } from "@/components/ui/label";
import { Send, AlignLeft, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTokenizer } from "kuromojin";
import { useSettings } from "../SettingsProvider";
import ImageUploader from "./ImageUploader";
import { useToast } from "@/hooks/use-toast";

const InputTextArea = () => {
    const [userText, setUserText] = useState<string>("");
    const [japaneseWordCount, setJapaneseWordCount] = useState(0);
    const { perPage, setPerPageContext } = useSettings();
    const perPageOptions = ["1", "3", "5", "10"];

    const { toast } = useToast();

    const router = useRouter();

    const handleSetSentencesPerPage = (requestedNumPages: string) => {
        // function to set number of pages in paginator based on user input
        setPerPageContext(Number(requestedNumPages));
        console.log("numSentences set to: ", requestedNumPages);
    };

    const handleTextEntry = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        console.log("event.target.value: ", event.target.value);
        setUserText(event.target.value);
        console.log("userText: ", userText);
    };
    const handleTextSubmit = () => {
        //split user text into an array
        const textArray = userText
            .split(/(?<=[。！？.!?])|\n/g) //split by sentence endings: .?!。！？ or new line
            .map((s) => s.trim()) // trim whitespace
            .map((s) => s.replace(/\n/g, "")) // remove any remaining new lines from each sentence
            .filter((x) => x !== ""); //filter out empty strings

        // const textArray = userText
        //     .split(/(.*[\.\?!。！？\n])/g)
        //     .filter((x) => x !== "");
        //save textArray to local storage
        console.log("setting text array to local storage: ", textArray);
        localStorage.setItem("textArray", JSON.stringify(textArray));
        console.log("about to push to paginator");
        router.push("/paginator", undefined);
    };

    const alertCopy = (content: string) => {
        try {
            toast({
                variant: "success",
                description: "Extracted text copied to clipboard.",
                duration: 2000,
            });
        } catch (err) {
            console.error("Failed to copy text: ", err);
            toast({
                variant: "destructive",
                title: "Copy Failed",
                description: "Could not copy text to clipboard.",
                duration: 2000,
            });
        }
    };

    useEffect(() => {
        // Retrieve textArray from local storage on component mount
        const previousTextArrayString = localStorage.getItem("textArray");
        if (previousTextArrayString) {
            const previousTextArray = JSON.parse(previousTextArrayString);
            if (Array.isArray(previousTextArray))
                setUserText(previousTextArray.join("\n"));
        }
    }, []);

    useEffect(() => {
        try {
            console.log("start input text area");
            console.log("userText: ", userText);
            getTokenizer({ dicPath: "/dict" })
                .then((tokenizer) => {
                    console.log("tokenizer: ", tokenizer);

                    // kuromoji.js's `tokenizer` instance
                    const tokens = tokenizer.tokenize(userText);
                    console.log("tokens: ", tokens);

                    if (Array.isArray(tokens)) {
                        console.log("tokens length: ", tokens.length);
                        setJapaneseWordCount(tokens.length);
                    }
                })
                .catch((error) => {
                    console.error("error when running getTokenizer", error);
                });

            // tokenizePromise(userText).catch((error) => {
            //   console.error("error when running tokenizePromise", error);
            // });

            console.log("userText:", userText);
            console.log("typeof userText:", typeof userText);
        } catch (error) {
            console.error("error when running useEffect", error);
        }
    }, [userText]);
    return (
        <div>
            <SectionHeader title="Text to Study" />
            <Card className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border border-blue-400/30 bg-gray-800 px-4 py-2 text-gray-100 shadow-xl">
                <CardHeader className="border-b border-gray-700/50 pb-2">
                    <CardTitle className="text-center text-lg font-bold text-white">
                        {"Insert text you want to analyze below"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="group relative flex flex-col items-center pt-4">
                    <textarea
                        onChange={handleTextEntry}
                        value={userText}
                        className="h-auto min-h-64 w-full rounded-md bg-black p-4 caret-white outline-none focus-within:outline-indigo-600"
                    />
                    <CopyButton
                        content={userText}
                        className="absolute right-8 top-5 bg-black text-black group-hover:text-white"
                        onCopy={alertCopy}
                    />
                    <div className="flex w-[80%] flex-row">
                        <div className="w-[50%]">
                            <ImageUploader setTextboxFunction={setUserText} />
                        </div>
                        <CommonButton
                            additionalclasses="w-[50%]"
                            onClick={handleTextSubmit}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Send className="h-5 w-5" /> Submit
                            </div>
                        </CommonButton>
                    </div>

                    {/* stats section */}
                    <div className="flex flex-row items-center gap-4">
                        {/* sentence count */}
                        <div className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/60 p-4">
                            <div className="rounded-full bg-amber-600/20 p-2">
                                <AlignLeft className="h-5 w-5 text-amber-300" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">
                                    Sentences
                                </p>
                                <p className="font-medium">
                                    {userText?.length}
                                </p>
                            </div>
                        </div>
                        {/* word count */}
                        <div className="col-span-2 flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/60 p-4">
                            <div className="rounded-full bg-pink-600/20 p-2">
                                <FileText className="h-5 w-5 text-red-300" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">
                                    Japanese Words
                                </p>
                                <p className="font-medium">
                                    {japaneseWordCount}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* stats section stop*/}

                    <Select
                        value={String(perPage)}
                        onValueChange={handleSetSentencesPerPage}
                    >
                        <Label className="mb-1 mr-auto mt-2 w-[150px]">
                            Sentences per page
                        </Label>
                        <SelectTrigger className="mb-2 mr-auto w-[150px] bg-black text-white shadow-md focus-within:outline-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 text-white">
                            {perPageOptions.map((value) => (
                                <SelectItem
                                    key={value}
                                    value={value}
                                    className={`hover:bg-grey-100 hover:font-bold focus:font-bold ${String(perPage) === value ? "font-bold" : ""}`}
                                >
                                    {value}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
        </div>
    );
};

export default InputTextArea;
