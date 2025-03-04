"use client";
import { useState } from "react";
import React from "react";

const InputTextArea = () => {
  const [userText, setUserText] = useState<String>("");

  
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold">Input Text</h1>
      <hr className="my-4" />
      <textarea onChange={(e) => setUserText(e.target.value)} className="w-[60%] bg-gray-200" />
      <p>{"Value of data: " + typeof userText ?? "nothing"}</p>
      <p>{"Length of data: " + userText?.length ?? 0}</p>
      <p>{"Length of data: " + userText?.split(' ')?.length ?? 0}</p>
    </div>
  );
};

export default InputTextArea;
