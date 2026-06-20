import SectionHeader from "@/components/common/SectionHeader";

const SUMMARY_PLACEHOLDERS = ["Overdue", "Due Today", "Upcoming", "Tracked"];

export default function DashboardLoading() {
    return (
        <div className="mx-2">
            <SectionHeader title="SRS Dashboard" />

            <div className="mx-auto mt-4 grid w-full max-w-6xl grid-cols-2 gap-3 sm:grid-cols-4">
                {SUMMARY_PLACEHOLDERS.map((label) => (
                    <div
                        key={label}
                        className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-center"
                    >
                        <div className="text-xs uppercase tracking-wider text-slate-500">
                            {label}
                        </div>
                        <div className="mx-auto mt-2 h-8 w-14 animate-pulse rounded bg-slate-700/80" />
                    </div>
                ))}
            </div>

            <div className="mx-auto mt-6 flex w-full max-w-6xl flex-wrap gap-2">
                {["All", "Overdue", "Due Today", "Upcoming"].map((label) => (
                    <div
                        key={label}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-500"
                    >
                        {label}
                    </div>
                ))}
            </div>

            <div className="mx-auto mt-4 w-full max-w-6xl rounded-xl border border-slate-700 bg-slate-900">
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 text-sm text-slate-400">
                    <div className="h-5 w-40 animate-pulse rounded bg-slate-700/80" />
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-24 animate-pulse rounded-md bg-slate-700/80" />
                        <div className="h-5 w-24 animate-pulse rounded bg-slate-700/80" />
                        <div className="h-8 w-20 animate-pulse rounded-md bg-slate-700/80" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1020px] text-sm">
                        <thead className="bg-slate-800 text-slate-300">
                            <tr>
                                {[
                                    "Term",
                                    "Reading",
                                    "Meaning",
                                    "Next Review",
                                    "Last Review",
                                    "Stability",
                                    "Difficulty",
                                    "Reps",
                                    "Lapses",
                                    "Delete",
                                ].map((header) => (
                                    <th key={header} className="px-3 py-2 text-left">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 20 }).map((_, index) => (
                                <tr key={index} className="border-t border-slate-800">
                                    <td className="px-3 py-3">
                                        <div className="h-4 w-32 animate-pulse rounded bg-slate-700/80" />
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="h-4 w-24 animate-pulse rounded bg-slate-700/80" />
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="h-4 w-40 animate-pulse rounded bg-slate-700/80" />
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="h-4 w-24 animate-pulse rounded bg-slate-700/80" />
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="h-4 w-24 animate-pulse rounded bg-slate-700/80" />
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <div className="ml-auto h-4 w-12 animate-pulse rounded bg-slate-700/80" />
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <div className="ml-auto h-4 w-12 animate-pulse rounded bg-slate-700/80" />
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <div className="ml-auto h-4 w-10 animate-pulse rounded bg-slate-700/80" />
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <div className="ml-auto h-4 w-10 animate-pulse rounded bg-slate-700/80" />
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <div className="ml-auto h-8 w-8 animate-pulse rounded-md bg-slate-700/80" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
