import Link from "next/link";

import { LatestPost } from "@/app/t3/_components/post";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
    const hello = await api.post.hello({ text: "from tRPC" });
    const session = await auth();

    if (session?.user) {
        void api.post.getLatest.prefetch();
    }

    return (
        <HydrateClient>
            <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                    <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
                        Japanese Vocab{" "}
                        <span className="text-[hsl(280,100%,70%)]">Study</span>{" "}
                        App
                    </h1>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
                        <Link
                            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
                            href="/"
                            target="_blank"
                        >
                            <h3 className="text-2xl font-bold">
                                Start studying straight away→
                            </h3>
                            <div className="text-lg">
                                Enter the text to study and we will break it up
                                into managable chunks for you. Each page can be
                                turned into a{" "}
                                <span className="text-[hsl(280,100%,70%)]">
                                    cheatsheet
                                </span>{" "}
                                or focused learning{" "}
                                <span className="text-[hsl(280,100%,70%)]">
                                    game
                                </span>
                                !
                            </div>
                        </Link>
                        <Link
                            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
                            href="https://github.com/tomPlus353/vocab-sheet-gen-ai.git"
                            target="_blank"
                        >
                            <h3 className="text-2xl font-bold">
                                Source Code →
                            </h3>
                            <div className="text-lg">
                                <p>Not learning Japanese? </p>
                                <p>No problem!</p> Learn more about this app and
                                how to build your own version for your own
                                target language!
                            </div>
                        </Link>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <p className="text-center text-2xl text-white">
                                {session && (
                                    <span>
                                        Logged in as {session.user?.name}
                                    </span>
                                )}
                            </p>
                            <Link
                                href={
                                    session
                                        ? "/api/auth/signout"
                                        : "/api/auth/signin"
                                }
                                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                            >
                                {session ? "Sign out" : "Sign in"}
                            </Link>
                        </div>
                    </div>

                    {session?.user && <LatestPost />}
                </div>
            </main>
        </HydrateClient>
    );
}
