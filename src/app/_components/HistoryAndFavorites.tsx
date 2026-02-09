import React from "react";
import Favorites from "./Favorites";
import History from "./History";
import { auth } from "@/server/auth";

const HistoryAndFavorites = async () => {
    const session = await auth();
    return (
        <section className="mt-16">
            {/* History and favorites section*/}
            <h2 className="mb-6 text-center text-lg font-semibold text-slate-100">
                Vocabulary Access
            </h2>
            {/* {session?.user ? ( */}
            <div className="grid gap-6 sm:grid-cols-2">
                {/* Favorites Flow */}
                <Favorites />

                {/* History Flow */}
                <History />
            </div>
            {/* ) : (
                <div className="flex justify-center">
                    <div className="max-w-md rounded-xl border border-slate-700 bg-slate-800 p-5">
                        <p className="text-center text-slate-200">
                            Please log in to save and view your history and
                            favorites.
                        </p>
                    </div>
                </div>
            )} */}
        </section>
    );
};

export default HistoryAndFavorites;
