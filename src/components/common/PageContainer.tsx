import * as React from "react";

export default function PageContainer({ ...props }) {
    return (
        <div className="h-screen w-full overflow-x-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-gray-300">
            {props.children}
        </div>
    );
}
