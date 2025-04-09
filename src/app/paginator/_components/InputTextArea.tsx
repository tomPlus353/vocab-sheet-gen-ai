"use client";
import React from "react";
import SectionHeader from "./SectionHeader";
import CommonButton from "./CommonButton";

interface Props {
  handleTextEntry: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleTextSubmit: () => void;
  userText: string;
  textArray: string[];
}

const InputTextArea = ({
  handleTextEntry,
  handleTextSubmit,
  userText,
  textArray,
}: Props) => {
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
      <p>{"Value of data: " + typeof userText}</p>
      <p>{"Length of data: " + userText?.length}</p>
      <p>{"Words in data: " + userText?.split(" ")?.length}</p>
      <p>{"Sentences in data: " + textArray.length}</p>
    </div>
  );
};

export default InputTextArea;
