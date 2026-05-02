"use client";

import * as React from "react";
import CommonButton from "@/components/common/CommonButton";
import { speakJapanese, stopSpeech } from "@/lib/speech";
import type { ExampleSentence, VocabTerm } from "@/lib/types/vocab";

type Props = {
    open: boolean;
    isGameOver: boolean;
    activeTerm: VocabTerm | null;
    correctionInput: string;
    correctionError: string;
    onCorrectionInputChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function CorrectionModal(props: Props) {
    const {
        open,
        isGameOver,
        activeTerm,
        correctionInput,
        correctionError,
        onCorrectionInputChange,
        onSubmit,
    } = props;

    const [ttsError, setTtsError] = React.useState<string>("");
    const [isSpeaking, setIsSpeaking] = React.useState(false);
    const [exampleSentence, setExampleSentence] =
        React.useState<ExampleSentence | null>(null);

    React.useEffect(() => {
        if (!open || !activeTerm) {
            setExampleSentence(null);
            setTtsError("");
            setIsSpeaking(false);
            stopSpeech();
            return;
        }

        const sentences = activeTerm.example_sentences ?? [];
        setExampleSentence(
            sentences.length > 0
                ? (sentences[Math.floor(Math.random() * sentences.length)] ??
                      null)
                : null,
        );
        setTtsError("");
        setIsSpeaking(false);
        stopSpeech();
    }, [open, activeTerm]);

    React.useEffect(() => {
        return () => {
            stopSpeech();
        };
    }, []);

    const handleToggleSpeakExampleSentence = async () => {
        if (!exampleSentence) return;

        if (isSpeaking) {
            stopSpeech();
            setIsSpeaking(false);
            return;
        }

        setTtsError("");
        const result = await speakJapanese(exampleSentence.japanese);
        if (!result.ok) {
            setTtsError(result.message);
            return;
        }

        setIsSpeaking(true);
        result.utterance.onend = () => setIsSpeaking(false);
        result.utterance.onerror = () => {
            setIsSpeaking(false);
            setTtsError("Text-to-speech failed. Try again.");
        };
    };

    if (!open || !activeTerm) {
        return null;
    }

    // if (exampleSentence) {
    //     alert("Example sentence found: " + exampleSentence.japanese);
    // } else {
    //     alert(
    //         "No example sentence found for term: " + JSON.stringify(activeTerm),
    //     );
    // }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-xl border border-red-300/30 bg-slate-900 p-5 text-white shadow-2xl">
                <h3 className="text-xl font-bold text-red-300">
                    {isGameOver ? "Final correction" : "First mistake"}
                </h3>
                <p className="mt-2 text-sm text-gray-300">
                    {isGameOver
                        ? "Type the correct Japanese term one last time to finish."
                        : "Type the correct Japanese term to resume."}
                </p>
                <p className="mt-3 rounded-md bg-slate-800 p-2 text-sm text-amber-100">
                    Clue: {activeTerm.english_definition}
                </p>
                {exampleSentence && (
                    <div className="mt-2 break-words rounded-md bg-slate-800 p-2 text-sm text-slate-100">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                                Example sentence
                            </p>
                            <CommonButton
                                type="button"
                                label={isSpeaking ? "Stop" : "Listen"}
                                additionalclasses="mx-0 my-0 rounded-md border-slate-500/50 bg-slate-700 px-2 py-1 text-xs text-slate-100 hover:bg-slate-600 hover:text-white"
                                onClick={handleToggleSpeakExampleSentence}
                            />
                        </div>
                        <p className="mt-1">{exampleSentence.japanese}</p>
                        <p className="mt-1 text-xs text-slate-300">
                            {exampleSentence.kana}
                        </p>
                        {ttsError && (
                            <p className="mt-2 text-xs text-red-300">
                                {ttsError}
                            </p>
                        )}
                    </div>
                )}
                <p className="mt-2 rounded-md border border-red-300/30 bg-red-500/10 p-2 text-sm">
                    Correct term:{" "}
                    <span className="font-bold text-red-200">
                        {activeTerm.japanese}
                    </span>
                </p>
                <p className="mt-2 text-xs text-amber-200/80">
                    Hint: {activeTerm.kana}
                </p>
                <form className="mt-4 flex flex-col gap-2" onSubmit={onSubmit}>
                    <input
                        autoFocus
                        type="text"
                        className="w-full rounded-md border border-red-400/40 bg-black px-3 py-2 text-white outline-none focus:border-red-400"
                        placeholder="Enter the exact Japanese term"
                        value={correctionInput}
                        onChange={(event) =>
                            onCorrectionInputChange(event.target.value)
                        }
                    />
                    {correctionError && (
                        <p className="text-sm text-red-300">
                            {correctionError}
                        </p>
                    )}
                    <CommonButton
                        type="submit"
                        label={isGameOver ? "Finish Game" : "Resume Game"}
                        additionalclasses="mx-0 bg-red-600 hover:bg-red-500"
                    />
                </form>
            </div>
        </div>
    );
}
