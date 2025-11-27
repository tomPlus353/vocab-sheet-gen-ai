import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import SectionHeader from "../../../components/common/SectionHeader";
import CommonButton from "@/components/common/CommonButton";
import { Grid2x2Check } from "lucide-react";
import { paginate } from "../_methods/paginationArray";
import { useSettings } from "@/app/SettingsProvider";

interface Props {
    allText: string[];
    numSentences: string;
}

const Paginator = ({ allText = [] }: Props) => {
    console.log("Paginator component start rendering!");

    //convert numSentences string from localstorage into a number
    const { perPage } = useSettings();

    // if (numSentences.toLowerCase() === "all") {
    //     numPerPage = allText.length;
    // } else {
    //     const parsed = parseInt(numSentences, 10);
    //     if (!isNaN(parsed) && parsed > 0) {
    //         numPerPage = parsed;
    //     } else {
    //         console.warn(
    //             `numSentences prop is not a valid number: ${numSentences}. Defaulting to 5.`,
    //         );
    //     }
    // }
    //other state variables
    const cannotPaginate = allText.length === 0;
    const totalPages = cannotPaginate ? 0 : Math.ceil(allText.length / perPage);
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
    const handleSetActiveText = (page = 1, allText: string[]) => {
        console.log(
            "handleSetActiveText called with page:",
            page,
            "and allText:",
            allText,
        );
        if (allText.length == 0) {
            return;
        }
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const textToSet = allText.slice(startIndex, endIndex);
        //console.log("Updating active text, textToSet:", textToSet);
        setActiveText(textToSet);
        localStorage.setItem("activeText", JSON.stringify(textToSet));
    };
    const handleGoMatch = () => {
        try {
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
                <SectionHeader title="Ereader" />
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

                    <div className="mx-2 flex min-w-[60%] max-w-fit flex-col rounded-xl border border-blue-400/30 bg-gray-800 px-4 py-2 shadow-md">
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
                            <div className="ml-auto flex flex-row">
                                <button
                                    className="has-tooltip relative ml-auto w-auto shrink rounded-xl border-2 border-solid border-blue-100/20 bg-blue-500/20 px-3 py-2 hover:bg-blue-500"
                                    onClick={handleGoMatch}
                                >
                                    <span className="tooltip absolute bottom-full right-0 -mt-8 rounded bg-black p-1 text-sm text-white shadow-lg">
                                        Generate game to study vocab
                                    </span>
                                    <div className="flex flex-row">
                                        <Grid2x2Check className="mx-auto h-5 w-5 md:mr-2"></Grid2x2Check>
                                        <span className="hidden md:inline">
                                            Match
                                        </span>
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
                                    "mx-1 px-1 bg-gray-800 text-gray-300 hover:bg-gray-800 hover:text-gray-300";
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
                                    disabled={isEllipsis}
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
