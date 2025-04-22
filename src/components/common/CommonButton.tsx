import React from "react";
import { twMerge } from "tailwind-merge";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string | number | undefined;
  additionalclasses?: string;
  answer?: string;
}

const CommonButton: React.FC<Props> = ({ label, ...props }) => {
  const baseStyles =
    "focus:outline-none mx-2 my-2 rounded-xl border-2 border-blue-100/20 bg-blue-500/50 px-4 py-2 shadow-md hover:bg-blue-400 hover:text-black";

  const styleString: string = twMerge(baseStyles, props.additionalclasses);
  return (
    <button {...props} className={styleString}>
      {label}
      {props.children}
    </button>
  );
};

export default CommonButton;
