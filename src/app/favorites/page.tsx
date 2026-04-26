import SectionHeader from "@/components/common/SectionHeader";
import { FavoritesPanel } from "@/components/common/FavoritesPanel";

export default function FavoritesPage() {
    return (
        <div className="mx-2">
            <SectionHeader title="Favorites" />
            <div className="mx-2 my-4 text-center text-gray-400">
                Review your starred terms and jump straight into practice modes.
            </div>

            <div className="mx-auto max-w-5xl">
                <FavoritesPanel />
            </div>

            <section className="mx-auto mt-10 max-w-5xl">
                <h2 className="mb-3 text-center text-lg font-semibold text-slate-100">
                    Planned Improvements
                </h2>
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-sm text-slate-300">
                    <ul className="list-disc space-y-2 pl-5">
                        <li>Search and filter favorites by term or tag.</li>
                        <li>Bulk-unstar / manage favorites in one place.</li>
                        <li>Export favorites to CSV for Anki or spreadsheets.</li>
                        <li>Optional cloud sync when login is enabled.</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}

