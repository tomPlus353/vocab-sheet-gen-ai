"use client";
import { useState } from "react";
import React from "react";

interface Props {
  handleTextEntry: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  userText: string;
  textArray: string[];
}

const InputTextArea = ({ handleTextEntry, userText, textArray }: Props) => {
  return (
    <div className="flex flex-col items-center bg-blue-400/20 text-indigo-300">
      <h1 className="text-4xl font-bold">Input Text</h1>
      <hr className="my-2 w-[100%] border-2 border-blue-100/20" />
      <textarea
        onChange={handleTextEntry}
        className="min-h-32 w-[80%] rounded-md bg-gray-800 text-gray-100"
      />
      <p>{"Value of data: " + typeof userText}</p>
      <p>{"Length of data: " + userText?.length}</p>
      <p>{"Words in data: " + userText?.split(" ")?.length}</p>
      <p>{"Sentences in data: " + textArray.length}</p>
      {/* debugging only */}
      {/* 
      {textArray.map((sentence, index) => (
        <p key={index}>{sentence}</p>
      ))} */}
      {/* debugging only */}
    </div>
  );
};

export default InputTextArea;
