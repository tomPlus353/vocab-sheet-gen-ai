import React from "react";

const History = () => {
    return (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            {/* History Flow */}
            <p className="mb-1 font-medium text-slate-100">🕘 History</p>
            <p className="mb-4 text-sm text-slate-400">
                Vocabulary grouped by analyzed text
            </p>

            <div className="space-y-3">
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-200">
                                JLPT N1 – Economy Article
                            </p>
                            <p className="text-xs text-slate-500">
                                18 words • Dec 28
                            </p>
                        </div>
                        <div className="flex gap-2 text-xs">
                            <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">
                                Study
                            </button>
                            <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">
                                View all
                            </button>
                        </div>
                    </div>
                </div>
                {/* <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-200">
                                Interview Prep Notes
                            </p>
                            <p className="text-xs text-slate-500">
                                12 words • Dec 15
                            </p>
                        </div>
                        <div className="flex gap-2 text-xs">
                            <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">
                                Study
                            </button>
                            <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">
                                View all
                            </button>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-200">System Design Doc</p>
                            <p className="text-xs text-slate-500">
                                24 words • Dec 02
                            </p>
                        </div>
                        <div className="flex gap-2 text-xs">
                            <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">
                                Study
                            </button>
                            <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">
                                View all
                            </button>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default History;
