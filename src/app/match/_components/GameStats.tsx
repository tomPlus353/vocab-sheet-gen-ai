"use client";
import React from "react";

type Props = {
    score: number;
    round: string;
    totalRounds: number;
    timer: number;
    gameVocabJson: Array<Record<string, string | boolean>>;
};

export function GameStats(props: Props) {
    const { score, round, totalRounds, timer, gameVocabJson } = props;

    return (
        <div className="mx-12 flex flex-row justify-between">
            <p className="text-lg font-semibold text-blue-300">
                {" "}
                {`Score: ${score}/${gameVocabJson.length / 2}`}
            </p>
            <p className="text-lg font-semibold text-blue-300">
                {" "}
                {`Round: ${round}/${totalRounds}`}
            </p>
            <p className="text-lg font-semibold text-blue-300">
                {" "}
                {`Time: ${timer}`}
            </p>
        </div>
    );
}
