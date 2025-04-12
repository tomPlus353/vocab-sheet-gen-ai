import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string | number | undefined;
  additionalClasses?: string;
}

const CommonButton: React.FC<Props> = ({ label, ...props }) => {
  const styleString: string =
    "mx-2 my-2 rounded-xl border-2 border-blue-100/20 bg-blue-500/20 px-4 py-2 shadow-md hover:bg-blue-500" +
    props.additionalClasses;
  return (
    <button {...props} className={styleString}>
      {label}
    </button>
  );
};

export default CommonButton;
