"use client";
import { useState } from "react";
import InputTextArea from "./_components/InputTextArea";
import Paginator from "./_components/Paginator";

function InputAndPaginate() {
  const [userText, setUserText] = useState<string>("");
  const [textArray, setTextArray] = useState<string[]>([]);

  const handleTextEntry = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserText(event.target.value);
    //split user text into an array
    //for any of these sentence endings: .?!\n。！？
    setTextArray(
      event.target.value.split(/[\.\?!\n。！？]/).filter((x) => x !== ""),
    );
  };
  const textAreaProps = {
    handleTextEntry,
    userText,
    textArray,
  };
  const paginatorProps = {
    allText: textArray,
  };

  return (
    <div className="h-screen w-screen bg-gray-800 text-gray-100">
      {/* ... other content ... */}
      <InputTextArea {...textAreaProps} />
      {/* ... more content ... */}
      <Paginator {...paginatorProps} />
    </div>
  );
}

export default InputAndPaginate;
