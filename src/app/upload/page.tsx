"use client";
import { useState } from "react";
import React from "react";

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [fileText, setFileText] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
        setSelectedFile(event.target.files[0]);
        const reader = new FileReader();
        reader.onload = (event) => {
          console.log(event?.target?.result);
          setFileText(event?.target?.result as string || "no text parsed from file");
        };
        reader.readAsText(event.target.files[0] as Blob);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold">Upload File</h1>
      <hr className="my-4" />
      <input type="file" onChange={handleFileChange} />
      {selectedFile && (
        <div>
          <h2 className="text-2xl font-bold">Selected File:</h2>
          <p>{selectedFile.name}</p>
          <p>{selectedFile.size} bytes</p>
        <textarea
          value={fileText}
          readOnly={true}
          //center text
          className={"w-full h-screen bg-gray-200 text-lg text-center"}
        />
        </div>
      )}
    </div>
  );
};

export default UploadPage;