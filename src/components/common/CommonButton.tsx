import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string | number | undefined;
  additionalclasses?: string;
}

const CommonButton: React.FC<Props> = ({ label, ...props }) => {
  const styleString: string =
    " focus:outline-none mx-2 my-2 rounded-xl border-2 border-blue-100/20 bg-blue-500/20 px-4 py-2 shadow-md hover:bg-blue-500 " +
    props.additionalclasses;
  return (
    <button {...props} className={styleString}>
      {label}
      {props.children}
    </button>
  );
};

export default CommonButton;
