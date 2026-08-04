type SrsGravityReviewStatusProps = {
    remainingTermsCount: number;
};

export function SrsGravityReviewStatus({
    remainingTermsCount,
}: SrsGravityReviewStatusProps) {
    return (
        <div className="mt-1 flex min-w-0 items-center text-xs text-slate-300 md:ml-auto md:mt-0">
            <span className="truncate whitespace-nowrap">
                {remainingTermsCount}{" "}
                {remainingTermsCount === 1 ? "term" : "terms"} remaining
            </span>
        </div>
    );
}
