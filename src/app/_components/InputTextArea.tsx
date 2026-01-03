"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Send, AlignLeft, FileText, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTokenizer } from "kuromojin";
import { useSettings } from "../SettingsProvider";
import ImageUploader from "./ImageUploader";
import { useToast } from "@/hooks/use-toast";

const InputTextArea = function () {
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

    const handleClearText = (_event: React.MouseEvent<HTMLButtonElement>) => {
        setUserText("");
        console.log("cleared user text");
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

    const alertCopy = (_content: string) => {
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
            <Card className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-xl border border-blue-400/30 bg-gray-800 px-4 py-2 text-gray-100 shadow-xl">
                <CardHeader className="mb-0 mr-auto pb-0">
                    <CardTitle className="text-md pb-2 font-bold text-gray-200">
                        {"Text to Study: "}
                    </CardTitle>
                </CardHeader>
                <CardContent className="group relative flex w-full flex-col items-stretch">
                    <textarea
                        placeholder={`Paste Japanese text here…

• JLPT reading passages
• Interview answers
• Articles or reports
• Work documents`}
                        onChange={handleTextEntry}
                        value={userText}
                        className="h-auto min-h-64 w-full rounded-md bg-black p-4 placeholder-slate-500 caret-white outline-none focus-within:outline-indigo-600"
                    />
                    {/* hover buttons section */}
                    <CopyButton
                        content={userText}
                        className="hover:bg-grey-400 opacity-1 invisible absolute right-16 top-5 text-black group-hover:visible group-hover:text-white"
                        onCopy={alertCopy}
                    />
                    <button
                        className="group invisible absolute right-12 top-7 bg-black text-black transition duration-200 ease-in-out hover:scale-110 hover:bg-gray-900 group-hover:visible group-hover:text-white"
                        onClick={handleClearText}
                    >
                        <X className="h-5 w-5 hover:text-red-500" />
                    </button>
                    {/* action buttons section */}
                    <div className="mb-4 grid w-full grid-cols-1 sm:grid-cols-2 sm:gap-2">
                        <ImageUploader
                            setTextboxFunction={setUserText}
                            className="w-full text-sm"
                        />

                        <CommonButton
                            additionalclasses="w-full  text-sm"
                            onClick={handleTextSubmit}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Send className="h-5 w-5" /> Submit
                            </div>
                        </CommonButton>
                    </div>
                    {/* select per page section */}
                    <div className="mx-auto mb-4">
                        <Select
                            value={String(perPage)}
                            onValueChange={handleSetSentencesPerPage}
                        >
                            <Label className="] mx-auto mb-1 mt-2">
                                Study pace
                            </Label>
                            <SelectTrigger className="mx-auto mb-2 w-[150px] bg-black text-white shadow-md focus-within:outline-none">
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
                    </div>

                    {/* stats section */}
                    <div className="mb-4 flex flex-row items-center gap-4">
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
                </CardContent>
            </Card>
        </div>
    );
};

export default InputTextArea;
