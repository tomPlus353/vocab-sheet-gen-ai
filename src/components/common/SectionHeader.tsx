"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SectionHeaderProps {
    title: string;
}

export default function SectionHeader(props: SectionHeaderProps) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = React.useState(false);
    const menuId = React.useId();
    const menuRootRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (!menuOpen) return;

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") setMenuOpen(false);
        }

        function onPointerDown(e: MouseEvent | TouchEvent) {
            const target = e.target as Node | null;
            if (!target) return;
            if (menuRootRef.current?.contains(target)) return;
            setMenuOpen(false);
        }

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("mousedown", onPointerDown);
        window.addEventListener("touchstart", onPointerDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("mousedown", onPointerDown);
            window.removeEventListener("touchstart", onPointerDown);
        };
    }, [menuOpen]);

    return (
        <div className="flex w-[100%] flex-col items-center">
            <hr className="w-[100%] border-2 border-blue-100/20" />
            <div ref={menuRootRef} className="w-full py-1">
                <div className="grid w-full grid-cols-[auto,1fr,auto] items-center">
                    <div className="relative flex items-center">
                        <button
                            type="button"
                            aria-haspopup="menu"
                            aria-controls={menuId}
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen((v) => !v)}
                            className="ml-2 inline-flex items-center gap-2 rounded-md border border-blue-100/20 bg-transparent px-3 py-2 text-sm font-semibold text-blue-50/90 hover:bg-blue-100/10 focus:outline-none focus:ring-2 focus:ring-blue-200/40"
                        >
                            <MenuButtonContent />
                        </button>

                        {menuOpen ? (
                            <div
                                id={menuId}
                                role="menu"
                                aria-label="Global navigation"
                                className="absolute left-2 top-[110%] z-50 w-56 overflow-hidden rounded-lg border border-blue-100/20 bg-slate-950/95 shadow-xl backdrop-blur"
                            >
                                <nav className="flex flex-col py-2">
                                    <MenuItem href="/" active={pathname === "/"} onNavigate={() => setMenuOpen(false)}>
                                        Home
                                    </MenuItem>
                                    <MenuItem
                                        href="/history"
                                        active={pathname?.startsWith("/history") ?? false}
                                        onNavigate={() => setMenuOpen(false)}
                                    >
                                        History
                                    </MenuItem>
                                    <MenuItem
                                        href="/favorites"
                                        active={pathname?.startsWith("/favorites") ?? false}
                                        onNavigate={() => setMenuOpen(false)}
                                    >
                                        Favorites
                                    </MenuItem>
                                    <MenuItem
                                        href="/dashboard"
                                        active={pathname?.startsWith("/dashboard") ?? false}
                                        onNavigate={() => setMenuOpen(false)}
                                    >
                                        Dashboard
                                    </MenuItem>
                                </nav>
                            </div>
                        ) : null}
                    </div>

                    <h1 className="px-2 text-center text-4xl font-bold">{props.title}</h1>

                    <button
                        type="button"
                        aria-hidden="true"
                        tabIndex={-1}
                        className="mr-2 inline-flex items-center gap-2 rounded-md border border-blue-100/20 bg-transparent px-3 py-2 text-sm font-semibold opacity-0"
                    >
                        <MenuButtonContent />
                    </button>
                </div>
            </div>
            <hr className="w-[100%] border-2 border-blue-100/20" />
        </div>
    );
}

function MenuButtonContent() {
    return (
        <>
            <span className="hidden select-none sm:inline">Menu</span>
            <span aria-hidden="true" className="text-lg leading-none">
                ≡
            </span>
        </>
    );
}

function MenuItem(props: {
    href: string;
    active: boolean;
    onNavigate: () => void;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={props.href}
            role="menuitem"
            onClick={props.onNavigate}
            className={[
                "px-4 py-2 text-sm font-semibold transition",
                props.active ? "bg-blue-100/10 text-blue-50" : "text-blue-50/80 hover:bg-blue-100/10 hover:text-blue-50",
            ].join(" ")}
        >
            {props.children}
        </Link>
    );
}
