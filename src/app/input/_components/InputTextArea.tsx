"use client";
import React from "react";
import { useEffect, useState } from "react";
import SectionHeader from "../../../components/common/SectionHeader";
import CommonButton from "@/components/common/CommonButton";
import { Send, AlignLeft, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTokenizer } from "kuromojin";

interface Props {
  handleTextEntry: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleTextSubmit: () => void;
  userText: string;
}

const InputTextArea = ({
  handleTextEntry,
  handleTextSubmit,
  userText,
}: Props) => {
  const [japaneseWordCount, setJapaneseWordCount] = useState(0);
  // async function tokenizePromise(userText: string) {
  //   await tokenize(userText)
  //     .then((tokens) => {
  //       console.log(tokens);
  //       setJapaneseWordCount(tokens.length);
  //     })
  //     .catch((e) => console.error(e));
  // }

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
      <SectionHeader title="Input Text" />
      <Card className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border border-blue-400/30 bg-gray-800 px-4 py-2 text-gray-100 shadow-xl">
        <CardHeader className="border-b border-gray-700/50 pb-2">
          <CardTitle className="text-center text-lg font-bold text-white">
            {"Insert text you want to analyze below"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center pt-4">
          <textarea
            onChange={handleTextEntry}
            className="h-auto min-h-64 w-[80%] rounded-md bg-black p-4 caret-white outline-none focus-within:outline-indigo-600"
          />
          <CommonButton additionalclasses="w-[80%]" onClick={handleTextSubmit}>
            <div className="flex items-center justify-center gap-2">
              <Send className="h-5 w-5" /> Submit
            </div>
          </CommonButton>
          {/* stats section */}
          <div className="flex flex-row items-center gap-4">
            {/* sentence count */}
            <div className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/60 p-4">
              <div className="rounded-full bg-amber-600/20 p-2">
                <AlignLeft className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Sentences</p>
                <p className="font-medium">{userText?.length}</p>
              </div>
            </div>
            {/* word count */}
            <div className="col-span-2 flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/60 p-4">
              <div className="rounded-full bg-pink-600/20 p-2">
                <FileText className="h-5 w-5 text-red-300" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Japanese Words</p>
                <p className="font-medium">{japaneseWordCount}</p>
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
