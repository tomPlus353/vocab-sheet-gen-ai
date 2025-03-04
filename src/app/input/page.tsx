"use client";
import { useState} from 'react';
import InputTextArea from './_components/InputTextArea'; 
import Paginator from './_components/Paginator'; 

    function InputToPaginate() {
      const [userText, setUserText] = useState<String>("");
      const [textArray, setTextArray] = useState<String[]>([]);

      const handleTextEntry = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserText(event.target.value);
        //split user text into an array
        //for any of these sentence endings: .?!\n。！？
        //  let sentenceEndings = [".", "?", "!", "\n", "。", "！", "？"];
        setTextArray(
          event.target.value
          .split(/[\.\?!\n。！？]/)
        .filter((x) => x !== "")
      );
      };
      const textAreaProps = {
        handleTextEntry,
        userText,
        textArray
      }
      const paginatorProps = {
        
      }
      return (
        <div>
          {/* ... other content ... */}
          <InputTextArea {...textAreaProps} />
          {/* ... more content ... */}
          <Paginator {...paginatorProps} />

        </div>
      );
    }

export default InputToPaginate;
