import SectionHeader from "@/components/common/SectionHeader";
import { HistoryPanel } from "@/components/common/HistoryPanel";

export default function HistoryPage() {
    return (
        <div className="mx-2">
            <SectionHeader title="History" />
            <div className="mx-2 my-4 text-center text-gray-400">
                Review your saved study sessions, import your own lists, and
                jump back into practice.
            </div>

            <div className="mx-auto max-w-5xl">
                <HistoryPanel />
            </div>

            <section className="mx-auto mt-10 max-w-5xl">
                <h2 className="mb-3 text-center text-lg font-semibold text-slate-100">
                    Planned Improvements
                </h2>
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-sm text-slate-300">
                    <ul className="list-disc space-y-2 pl-5">
                        <li>Search and filter by term, tag, or source.</li>
                        <li>Pin favorite history sets to the top.</li>
                        <li>Export sets to CSV for Anki or spreadsheets.</li>
                        <li>Optional cloud sync when login is enabled.</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}

