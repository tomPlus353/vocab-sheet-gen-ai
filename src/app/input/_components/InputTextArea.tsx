"use client";
import React from "react";
import { useEffect, useState } from "react";
import SectionHeader from "../../../components/common/SectionHeader";
import CommonButton from "@/components/common/CommonButton";

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
  // pnpm build && NODE_OPTIONS="--inspect" pnpm start
  return (
    <div className="flex flex-col items-center">
      <SectionHeader title="Input Text" />
      <textarea
        onChange={handleTextEntry}
        className="h-auto min-h-32 w-[80%] rounded-md bg-gray-800 p-4 caret-white outline-none focus-within:outline-indigo-600"
      />
      <CommonButton
        className="my-4"
        onClick={handleTextSubmit}
        label="Submit"
      />
      <p>{"Length of data: " + userText?.length}</p>
      <p>{"Words in data: " + japaneseWordCount}</p>
      {/* <p>{"Sentences in data: " + textArray.length}</p> */}
    </div>
  );
};

export default InputTextArea;
