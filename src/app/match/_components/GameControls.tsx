"use client";
import React, { useState } from "react";
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
    } = props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const CONTROL_BUTTON_STYLE =
        "mx-1 p-1 bg-indigo-600 shadow-md focus-within:outline-indigo-600 text-white";

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

    return (
        <div className="flex flex-wrap justify-start">
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
            <div className="mr-auto flex items-center gap-1 text-lg">
                <Checkbox
                    className="border-indigo-800 bg-gray-200 data-[state=checked]:bg-indigo-900"
                    id="hide-reading"
                    checked={isHideReading}
                    onCheckedChange={() =>
                        setIsHideReading(isHideReading ? false : true)
                    }
                ></Checkbox>
                <Label
                    htmlFor="hide-reading"
                    className="cursor-pointer text-lg"
                >
                    <p>Hide Reading</p>
                </Label>
            </div>

            <div className="mr-auto flex items-center gap-1 text-lg">
                <Checkbox
                    className="border-indigo-800 bg-gray-200 data-[state=checked]:bg-indigo-900"
                    id="test-reading"
                    checked={isTestReading}
                    onCheckedChange={() =>
                        setIsTestReading(isTestReading ? false : true)
                    }
                ></Checkbox>
                <Label
                    htmlFor="test-reading"
                    className="cursor-pointer text-lg"
                >
                    <p>Test Reading</p>
                </Label>
            </div>
            {/* row changing UI */}
            <div className="flex flex-row">
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
                <div className="mr-auto flex flex-col items-start gap-1 text-lg">
                    <Label className="mb-1" htmlFor="round-select">
                        Round
                    </Label>
                    <Select value={round} onValueChange={handleRoundChange}>
                        <SelectTrigger
                            id="round-select"
                            className="mb-2 bg-black text-white shadow-md focus-within:outline-none"
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
            <EditTermsModal open={isModalOpen} onOpenChange={setIsModalOpen} />
        </div>
    );
}
