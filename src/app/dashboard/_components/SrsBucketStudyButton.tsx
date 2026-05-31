"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ConfirmActionModal } from "@/components/common/modals/ConfirmActionModal";
import CommonButton from "@/components/common/CommonButton";
import type { SrsDashboardBucket } from "@/lib/types/srs";

const bucketLabel: Record<SrsDashboardBucket, string> = {
    overdue: "Overdue",
    due_today: "Due Today",
    upcoming: "Upcoming",
};

type Props = {
    bucket: SrsDashboardBucket;
};

export function SrsBucketStudyButton({ bucket }: Props) {
    const router = useRouter();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    return (
        <>
            <CommonButton
                label={`Study terms that are ${bucketLabel[bucket]}`}
                additionalclasses="mx-0 bg-emerald-700 hover:bg-emerald-600"
                onClick={() => setIsConfirmOpen(true)}
            />
            <ConfirmActionModal
                open={isConfirmOpen}
                title={`Start ${bucketLabel[bucket]} SRS Gravity Study?`}
                description="This run will study only this bucket and disable Favorites mode and Edit Terms. Your gravity progress will be preserved. The game will pick up a maximum of 50 selected terms."
                confirmLabel="Continue to Gravity"
                onOpenChange={setIsConfirmOpen}
                onConfirm={() =>
                    router.push(`/gravity?srsMode=1&srsBucket=${bucket}`)
                }
            />
        </>
    );
}
