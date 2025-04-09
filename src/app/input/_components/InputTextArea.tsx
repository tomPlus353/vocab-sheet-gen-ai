"use client";
import React from "react";
import { useEffect, useState } from "react";
import SectionHeader from "./SectionHeader";
import CommonButton from "./CommonButton";

import { tokenize, getTokenizer } from "kuromojin";

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

  useEffect(() => {
    getTokenizer({ dicPath: "dict" }).then((tokenizer) => {
      // kuromoji.js's `tokenizer` instance
    });

    tokenize(userText).then((tokens) => {
      console.log(tokens);
      setJapaneseWordCount(tokens.length);

      /*
      [ {
        word_id: 509800,          // 辞書内での単語ID
        word_type: 'KNOWN',       // 単語タイプ(辞書に登録されている単語ならKNOWN, 未知語ならUNKNOWN)
        word_position: 1,         // 単語の開始位置
        surface_form: '黒文字',    // 表層形
        pos: '名詞',               // 品詞
        pos_detail_1: '一般',      // 品詞細分類1
        pos_detail_2: '*',        // 品詞細分類2
        pos_detail_3: '*',        // 品詞細分類3
        conjugated_type: '*',     // 活用型
        conjugated_form: '*',     // 活用形
        basic_form: '黒文字',      // 基本形
        reading: 'クロモジ',       // 読み
        pronunciation: 'クロモジ'  // 発音
        } ]
        */
    });
  }, [userText]);

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
