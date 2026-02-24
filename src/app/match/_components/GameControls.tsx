"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import CommonButton from "@/components/common/CommonButton";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { EditTermsModal } from "./EditTermsModal";

type Props = {
    startGame: () => void;
    round: string;
    roundsArray: string[];
    totalRounds: number;
    handleRoundChange: (newRound: string) => void;
    isHideReading: boolean;
    setIsHideReading: (value: boolean) => void;
    isTestReading: boolean;
    setIsTestReading: (value: boolean) => void;
    isFavoritesMode: boolean;
    setIsFavoritesMode: (value: boolean) => void;
    allRoundsVocabJson: Record<string, string | boolean>[];
    setAllRoundsVocabJson: React.Dispatch<
        React.SetStateAction<Record<string, string | boolean>[]>
    >;
};

export function GameControls(props: Props) {
    const {
        startGame,
        round,
        roundsArray,
        totalRounds,
        handleRoundChange,
        isHideReading,
        setIsHideReading,
        isTestReading,
        setIsTestReading,
        isFavoritesMode,
        setIsFavoritesMode,
        allRoundsVocabJson,
        setAllRoundsVocabJson,
    } = props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAllFavoritesReviewMode, setIsAllFavoritesReviewMode] =
        useState(false);
    const router = useRouter();

    const CONTROL_BUTTON_STYLE =
        "mx-1 p-1 bg-indigo-600 shadow-md focus-within:outline-indigo-600 text-white text-sm sm:text-sm md:text-lg";

    function computeRoundButtonStyle(direction: "prev" | "next") {
        // base style
        let buttonStyle = CONTROL_BUTTON_STYLE;
        // add invisible class if at first or last round
        if (direction === "prev" && Number(round) <= 1) {
            buttonStyle += " invisible";
        }
        if (direction === "next" && Number(round) >= totalRounds) {
            buttonStyle += " invisible";
        }
        return buttonStyle;
    }

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setIsAllFavoritesReviewMode(urlParams.get("favorites") === "1");
    }, []);

    return (
        <div className="flex flex-col gap-1">
            {/* Row 1 - Buttons (Left) and Round Selector (Right) */}
            <div className="flex items-center justify-between">
                {/* Section 1 - Nav Buttons */}
                <div className="flex gap-2">
                    <CommonButton
                        //emoji for going back
                        label={"↩ Back to Ereader"}
                        additionalclasses={CONTROL_BUTTON_STYLE}
                        onClick={() => router.back()}
                    />
                    <CommonButton
                        //emoji for going back
                        label={"⟳ Play Again"}
                        additionalclasses={CONTROL_BUTTON_STYLE}
                        onClick={() => startGame()}
                    />
                    <CommonButton
                        //emoji editing terms
                        label={"✎ Edit Terms"}
                        additionalclasses={CONTROL_BUTTON_STYLE}
                        onClick={() => setIsModalOpen(true)}
                    />
                </div>

                {/* Round changing UI */}
                <div className="flex items-center gap-2">
                    <CommonButton
                        label={"<"}
                        additionalclasses={
                            computeRoundButtonStyle("prev") ?? "invisible"
                        }
                        onClick={() =>
                            handleRoundChange(
                                Math.max(1, Number(round) - 1).toString(),
                            )
                        }
                    />
                    {totalRounds > 1 && (
                        <div className="flex flex-col items-start gap-1">
                            <Label
                                className="text-sm md:text-lg"
                                htmlFor="round-select"
                            >
                                Round
                            </Label>
                            <Select
                                value={round}
                                onValueChange={handleRoundChange}
                            >
                                <SelectTrigger
                                    id="round-select"
                                    className="bg-black text-white shadow-md focus-within:outline-none"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 text-white">
                                    {roundsArray.map((value) => (
                                        <SelectItem
                                            key={value}
                                            value={value}
                                            className={`hover:bg-grey-100 hover:font-bold focus:font-bold ${round === value ? "font-bold" : ""}`}
                                        >
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <CommonButton
                        label={">"}
                        additionalclasses={
                            computeRoundButtonStyle("next") ?? "invisible"
                        }
                        onClick={() =>
                            handleRoundChange(
                                Math.max(1, Number(round) + 1).toString(),
                            )
                        }
                    />
                </div>
            </div>

            {/* Row 2 - Checkboxes (Distinct Section) */}
            <div className="w-full border border-x-0 border-gray-700 bg-gray-900 px-4 py-3">
                <div className="flex justify-center gap-6">
                    {/* hide reading */}
                    <label
                        htmlFor="hide-reading"
                        className="flex cursor-pointer items-center gap-3"
                    >
                        <Checkbox
                            className="h-5 w-5 rounded-sm border-gray-500 bg-transparent data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
                            id="hide-reading"
                            checked={isHideReading}
                            onCheckedChange={() =>
                                setIsHideReading(!isHideReading)
                            }
                        />
                        <span className="text-sm font-medium text-gray-200">
                            Hide Reading
                        </span>
                    </label>

                    {/* Test Reading */}
                    <label
                        htmlFor="test-reading"
                        className="flex cursor-pointer items-center gap-3"
                    >
                        <Checkbox
                            className="h-5 w-5 rounded-sm border-gray-500 bg-transparent data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
                            id="test-reading"
                            checked={isTestReading}
                            onCheckedChange={() =>
                                setIsTestReading(!isTestReading)
                            }
                        />
                        <span className="text-sm font-medium text-gray-200">
                            Test Reading
                        </span>
                    </label>

                    {
                        // hide favorites only checkbox if the user is reviewing all favorites from previous games
                        !isAllFavoritesReviewMode && (
                            <label
                                htmlFor="favorites-only"
                                className="flex cursor-pointer items-center gap-3"
                            >
                                <Checkbox
                                    className="h-5 w-5 rounded-sm border-gray-500 bg-transparent data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
                                    id="favorites-only"
                                    checked={isFavoritesMode}
                                    onCheckedChange={() =>
                                        setIsFavoritesMode(!isFavoritesMode)
                                    }
                                />
                                <span className="text-sm font-medium text-gray-200">
                                    Favorites only
                                </span>
                            </label>
                        )
                    }
                </div>
            </div>
            <EditTermsModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                terms={allRoundsVocabJson}
                setTerms={setAllRoundsVocabJson}
            />
        </div>
    );
}
