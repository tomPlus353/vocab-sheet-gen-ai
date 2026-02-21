import React from "react";
import { twMerge } from "tailwind-merge";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string | number | undefined;
    additionalclasses?: string;
    isTempDisabled?: boolean;
}

const CommonButton: React.FC<Props> = ({
    label,
    additionalclasses,
    isTempDisabled,
    ...props
}) => {
    const className =
        "focus:outline-none flex-wrap mx-2 my-2 rounded-xl border-2 border-blue-100/20 bg-blue-500/50 px-2 py-1 shadow-md hover:bg-blue-300 hover:text-black";

    let styleString: string = twMerge(className, additionalclasses);

    //if isDisabled is true, add disabled styles
    if (isTempDisabled) {
        styleString = twMerge(
            styleString,
            " cursor-not-allowed opacity-50 hover:bg-blue-500/50 hover:text-black",
        );
    }
    return (
        <button {...props} className={styleString}>
            {label}
            {props.children}
        </button>
    );
};

export default CommonButton;
