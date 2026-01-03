import React from "react";

const Favorites = () => {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-800 p-5">
            {/* Favorites Flow */}
            <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-slate-100">⭐ Favorites</p>
                <div className="flex gap-2 text-xs">
                    <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">
                        Study
                    </button>
                    <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">
                        View all
                    </button>
                </div>
            </div>
            <p className="mb-3 text-sm text-slate-400">
                Most recent starred terms
            </p>
            <div>
                <ul className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                    <li className="flex justify-between">
                        <span>重要</span>
                        <span className="text-slate-500">important</span>
                    </li>
                    <li className="flex justify-between">
                        <span>制約条件</span>
                        <span className="text-slate-500">constraint</span>
                    </li>
                    <li className="flex justify-between">
                        <span>KPI</span>
                        <span className="text-slate-500">key indicator</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Favorites;
