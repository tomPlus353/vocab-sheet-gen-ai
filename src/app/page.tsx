"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import InputTextArea from "./_components/InputTextArea";

function TextInputPage() {
  const [userText, setUserText] = useState<string>("");

  const router = useRouter();

  const handleTextEntry = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log("event.target.value: ", event.target.value);
    setUserText(event.target.value);
    console.log("userText: ", userText);
  };
  const handleTextSubmit = () => {
    //split user text into an array
    //for any of these sentence endings: .?!\n。！？
    const textArray = userText.split(/[\.\?!\n。！？]/).filter((x) => x !== "");
    //save textArray to local storage
    console.log("setting text array to local storage: ", textArray);
    localStorage.setItem("textArray", JSON.stringify(textArray));
    console.log("about to push to paginator");
    router.push("/paginator", undefined);
  };

  const textAreaProps = {
    handleTextEntry,
    handleTextSubmit,
    userText,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-gray-100">
      {/* ... other content ... */}
      <div className="mx-2">
        <InputTextArea {...textAreaProps} />
      </div>
    </div>
  );
}

export default TextInputPage;
