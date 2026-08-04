import {
    BookOpen,
    CheckCircle2,
    CircleAlert,
    Clock3,
    TriangleAlert,
} from "lucide-react";

type GravityGameStatsProps = {
    atRiskTermsCount: number;
    isTermAtRisk: boolean;
    learningTermsCount: number;
    learntTermsCount: number;
    timer: number;
    unlearntTermsCount: number;
};

function StatPill(props: {
    icon: React.ReactNode;
    value: React.ReactNode;
    className: string;
    tooltip: string;
}) {
    return (
        <div
            className={`inline-flex items-center gap-1 rounded-2xl border px-2.5 py-1 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] ${props.className}`}
            title={props.tooltip}
        >
            {props.icon}
            <span>{props.value}</span>
        </div>
    );
}

export function GravityGameStats({
    atRiskTermsCount,
    isTermAtRisk,
    learningTermsCount,
    learntTermsCount,
    timer,
    unlearntTermsCount,
}: GravityGameStatsProps) {
    return (
        <>
            <div className="mt-1 flex items-center gap-1 md:ml-1 md:mt-0 md:shrink-0">
                <StatPill
                    icon={<TriangleAlert className="h-3.5 w-3.5" />}
                    value={atRiskTermsCount}
                    className="border-rose-500/65 bg-rose-500/15 text-rose-200"
                    tooltip="Terms currently at risk (one miss away)"
                />
                <StatPill
                    icon={<CircleAlert className="h-3.5 w-3.5" />}
                    value={unlearntTermsCount}
                    className="border-red-500/65 bg-red-500/15 text-red-200"
                    tooltip="Unlearnt terms remaining"
                />
                <StatPill
                    icon={<BookOpen className="h-3.5 w-3.5" />}
                    value={learningTermsCount}
                    className="border-amber-500/65 bg-amber-500/15 text-amber-200"
                    tooltip="Learning terms in this run"
                />
                <StatPill
                    icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                    value={learntTermsCount}
                    className="border-emerald-500/65 bg-emerald-500/15 text-emerald-200"
                    tooltip="Learnt terms in this run"
                />
                <StatPill
                    icon={<Clock3 className="h-3.5 w-3.5" />}
                    value={`${timer}s`}
                    className="border-blue-500/65 bg-blue-500/15 text-blue-200"
                    tooltip="Elapsed time in this game"
                />
            </div>

            <div className="mt-1 flex min-w-0 items-center gap-1 text-xs md:ml-auto md:mt-0">
                <span
                    className={`truncate whitespace-nowrap ${
                        isTermAtRisk
                            ? "font-semibold text-red-300"
                            : "text-slate-300"
                    }`}
                    title={
                        isTermAtRisk
                            ? "At least one term is currently one miss away from game over."
                            : undefined
                    }
                >
                    {isTermAtRisk
                        ? "Warning: one more miss can end the game"
                        : "Miss twice = game over"}
                </span>
            </div>
        </>
    );
}
