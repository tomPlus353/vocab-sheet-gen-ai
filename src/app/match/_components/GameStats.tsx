"use client";
import type { VocabTerm } from "@/lib/types/vocab";
import React from "react";

type Props = {
    score: number;
    round: string;
    totalRounds: number;
    timer: number;
    gameVocabJson: VocabTerm[];
};

export function GameStats(props: Props) {
    const { score, round, totalRounds, timer, gameVocabJson } = props;

    return (
        <div>
            <div className="border border-x-0 border-gray-600 bg-gray-700/50">
                <div className="mx-auto grid max-w-3xl grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                        <span className="text-sm uppercase tracking-wider text-indigo-400">
                            Score
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-indigo-400 md:text-4xl">
                                {score}
                            </span>
                            <span className="text-lg text-gray-400">
                                / {gameVocabJson.length / 2}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <span className="text-sm uppercase tracking-wider text-indigo-400">
                            Round
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-indigo-400 md:text-4xl">
                                {round}
                            </span>
                            <span className="text-lg text-gray-400">
                                / {totalRounds}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <span className="text-sm uppercase tracking-wider text-indigo-400">
                            Time
                        </span>
                        <div className="mt-2">
                            <span className="text-3xl font-extrabold text-indigo-400 md:text-4xl">
                                {timer}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
