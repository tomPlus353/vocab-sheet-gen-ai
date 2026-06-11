"use client";

import { useRouter } from "next/navigation";

import CommonButton from "@/components/common/CommonButton";

type StudyFavoritesButtonProps = {
    favoriteCount: number;
    historyTermsKey?: string;
    onClick?: () => void;
};

export function StudyFavoritesButton({
    favoriteCount,
    historyTermsKey,
    onClick,
}: StudyFavoritesButtonProps) {
    const router = useRouter();
    const isDisabled = favoriteCount <= 0;

    return (
        <CommonButton
            label="Study Favorite Terms"
            additionalclasses="mx-0 min-h-10 w-full px-4 text-sm font-semibold sm:w-auto"
            disabled={isDisabled}
            isTempDisabled={isDisabled}
            onClick={() => {
                if (isDisabled) return;
                if (onClick) {
                    onClick();
                    return;
                }
                if (historyTermsKey) {
                    const params = new URLSearchParams({
                        history: "1",
                        historyTerms: historyTermsKey,
                        historyFavorites: "1",
                    });
                    router.push(`/gravity?${params.toString()}`);
                    return;
                }
                router.push("/gravity?favorites=1");
            }}
        />
    );
}
