"use client";
import { useState } from "react";
import React from "react";

interface Props {
  handleTextEntry: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  userText: String;
  textArray: String[];
}

const InputTextArea = ({handleTextEntry, userText, textArray} : Props) => {


  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold">Input Text</h1>
      <hr className="my-4" />
      <textarea onChange={handleTextEntry} className="w-[60%] bg-gray-200" />
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
