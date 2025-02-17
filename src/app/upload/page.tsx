"use client";
import { useState } from "react";
import React from "react";

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
        setSelectedFile(event.target.files[0]);
    }
  };

  return (
    <div>
      <h1>Upload File</h1>
      <input type="file" onChange={handleFileChange} />
      {selectedFile && (
        <div>
          <h2>Selected File:</h2>
          <p>{selectedFile.name}</p>
          <p>{selectedFile.size} bytes</p>
        </div>
      )}
    </div>
  );
};

export default UploadPage;