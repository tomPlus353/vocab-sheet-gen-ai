import * as React from "react";

export interface SectionHeaderProps {
    title: string;
}

export default function SectionHeader(props: SectionHeaderProps) {
    return (
        <div className="flex w-[100%] flex-col items-center">
            <hr className="my-2 w-[100%] border-2 border-blue-100/20" />
            <h1 className="py-2 text-center text-4xl font-bold">
                {props.title}
            </h1>
            <hr className="my-2 w-[100%] border-2 border-blue-100/20" />
        </div>
    );
}
