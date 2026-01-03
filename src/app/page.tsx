import SectionHeader from "@/components/common/SectionHeader";

import InputTextArea from "./_components/InputTextArea";
import HistoryAndFavorites from "./_components/HistoryAndFavorites";

function TextInputPage() {
    return (
        <div className="mx-2">
            <SectionHeader title="Turn Any Text Into a Study Session" />
            <div className="mx-2 my-4 text-center text-gray-400">
                Paste text and automatically break it into pages, cheat sheets,
                and focused learning materials.
                <div className="mx-2 my-4 text-center text-gray-400">
                    <span className="font-bold">
                        Ideal for JLPT, interviews, technical docs, or articles
                    </span>
                </div>
            </div>

            <InputTextArea />

            <HistoryAndFavorites />
        </div>
    );
}

export default TextInputPage;
