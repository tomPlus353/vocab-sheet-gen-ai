import * as React from "react";

export default function PageContainer({ ...props }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-gray-100">
      {props.children}
    </div>
  );
}
