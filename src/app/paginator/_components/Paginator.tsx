import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import Modal from "./Modal";
import SectionHeader from "../../../components/common/SectionHeader";
import CommonButton from "@/components/common/CommonButton";
import { Gamepad } from "lucide-react";
import { paginate } from "../_methods/paginationArray";

interface Props {
    allText: string[];
}

const Paginator = ({ allText = [] }: Props) => {
    console.log("Paginator rendered!");

    //state for the current page
    const NUM_PER_PAGE = 5; //Warning, cannot be 0 or lower!
    const cannotPaginate = allText.length === 0;
    const totalPages = cannotPaginate
        ? 0
        : Math.ceil(allText.length / NUM_PER_PAGE);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [activeText, setActiveText] = useState<string[]>([]);
    const router = useRouter();
    const focusTarget = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [pageNumberArray, setPageNumberArray] = useState(
        paginate({ current: 1, max: totalPages })?.items,
    );
    console.log("pageNumberArray:", pageNumberArray);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        router.push(`?page=${page}`, undefined);
        handleSetActiveText(page, allText);
        setPageNumberArray(paginate({ current: page, max: totalPages })?.items);
    };

    //handler functions
    const handleSetActiveText = (page: number, allText: string[]) => {
        const startIndex = (page - 1) * NUM_PER_PAGE;
        const endIndex = startIndex + NUM_PER_PAGE;
        setActiveText(allText.slice(startIndex, endIndex));

        localStorage.setItem("activeText", activeText.join("\n"));
    };
    const handleGoMatch = () => {
        try {
            localStorage.setItem("activeText", activeText.join("\n"));
            router.push("/match", undefined);
        } catch (e) {
            console.log("Error pushing to match page: ", e);
        }
    };

    //set update active text when allText is changed
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get("page");
        const page = pageParam ? parseInt(pageParam, 10) : 1;

        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setPageNumberArray(
                paginate({ current: page, max: totalPages })?.items,
            ); // reset pagination
            handleSetActiveText(page, allText); // set active text to current page
            return;
        } else {
            setCurrentPage(1); // reset to first page when no page param is set in URL
            setPageNumberArray(
                paginate({ current: 1, max: totalPages })?.items,
            ); // set pagination
            // router.push(`?page=${1}`, undefined); // set page number in URL
            handleSetActiveText(currentPage, allText); // set active text to first page
        }
        //set focus on the paginator
        console.log("focusTarget.current:", focusTarget.current);
        if (focusTarget.current) {
            focusTarget.current.focus();
        } else {
            console.log("focusTarget is null");
        }
    }, [allText]);

    return !cannotPaginate ? (
        <div className="pagination">
            <div
                className="flex h-full w-full flex-col items-center focus-within:outline-none"
                onKeyDown={(e) => {
                    console.log("e.key:", e.key);
                    if (e.key === "ArrowLeft") {
                        // handle previous page	so long as we're not on the first page
                        if (currentPage > 1) {
                            handlePageChange(currentPage - 1);
                        }
                    }
                    if (e.key === "ArrowRight") {
                        // handle next page so long as we're not on the last page
                        if (currentPage < totalPages) {
                            handlePageChange(currentPage + 1);
                        }
                    }
                    // toggle modal open and closed on enter
                    if (e.key === "Enter" && !open) {
                        // handle enter key
                        e.preventDefault();
                        console.log("open: ", open);
                        setOpen(true);
                        console.log("open: ", open);
                    }
                    if (e.key === "Enter" && open) {
                        // handle enter key
                        e.preventDefault();
                        console.log("open: ", open);
                        setOpen(false);
                        console.log("open: ", open);
                    }
                }}
                ref={focusTarget}
                tabIndex={0}
            >
                {/* header */}
                <SectionHeader title="Paginator" />
                <CommonButton
                    additionalclasses="align-start mr-auto"
                    //emoji for going back
                    label={"← Start Again"}
                    onClick={() => router.push("/", undefined)}
                />
                {/* the reader and buttons to each side of it */}
                <div className="flex w-full flex-row justify-center">
                    {/* ereader with next/prev buttons */}

                    <CommonButton
                        label={"<"}
                        onClick={() => handlePageChange(currentPage - 1)}
                        additionalclasses={
                            currentPage - 1 > 0 ? "" : "invisible"
                        }
                    />

                    <div className="mx-2 flex w-[60%] md:w-[80%] flex-col rounded-xl border border-blue-400/30 bg-gray-800 px-4 py-2 shadow-md">
                        <h2 className="px-2 text-lg font-semibold text-blue-300">
                            {" "}
                            {`Page ${currentPage} of ${totalPages}`}
                        </h2>
                        {activeText.length > 0 &&
                            Array.from(
                                { length: activeText.length },
                                (_, i) => i + 1,
                            ).map((key) => (
                                <p key={key} className="px-2 py-1 text-lg">
                                    {activeText[key - 1]}
                                </p>
                            ))}
                        {activeText.length > 0 && (
                            <div className="ml-auto flex flex-row gap-2">
                                <button
                                    className="ml-auto w-auto rounded-xl border-2 border-solid border-blue-100/20 bg-blue-500/20 px-3 py-2 hover:bg-blue-500"
                                    onClick={handleGoMatch}
                                >
                                    <div className="flex flex-row">
                                        <Gamepad className="mr-2 h-5 w-5" />
                                        <span>Review</span>
                                    </div>
                                </button>
                                <Modal
                                    activeText={activeText}
                                    open={open}
                                    setOpen={setOpen}
                                ></Modal>
                            </div>
                        )}
                    </div>
                    <CommonButton
                        label={">"}
                        onClick={() => handlePageChange(currentPage + 1)}
                        additionalclasses={
                            currentPage + 1 <= totalPages ? "" : "invisible"
                        }
                    />
                </div>
                {/* pagination buttons sections */}
                <div className="flex justify-between">
                    {Array.from({ length: pageNumberArray?.length ?? 0 }).map(
                        (_, i) => {
                            const pageNumber = pageNumberArray?.[i];
                            const isNumber = typeof pageNumber === "number";
                            const isEllipsis = pageNumber === "…";
                            const isCurrent = pageNumber == currentPage;
                            // set the style for the button
                            // regular button style
                            let styleString =
                                "mx-1 px-2 bg-gray-800 text-gray-300 hover:bg-blue-500 hover:text-white";
                            if (isEllipsis) {
                                // ellipsis button style
                                styleString =
                                    "mx-1 px-2 bg-gray-800 text-gray-300 no-hover";
                            } else if (isCurrent) {
                                // current page button style
                                styleString =
                                    "mx-1 px-2 bg-blue-500 text-white";
                            }
                            return (
                                <CommonButton
                                    key={i}
                                    label={pageNumberArray?.[i]}
                                    additionalclasses={styleString}
                                    onClick={() =>
                                        isNumber
                                            ? handlePageChange(pageNumber)
                                            : null
                                    }
                                />
                            );
                        },
                    )}
                </div>
            </div>
        </div>
    ) : (
        <div></div>
    );
};

export default Paginator;
