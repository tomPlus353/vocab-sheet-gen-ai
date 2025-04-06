import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import Modal from "./Modal";
import SectionHeader from "./SectionHeader";
import CommonButton from "./CommonButton";

interface Props {
  allText?: string[];
}

const Paginator = ({ allText = [] }: Props) => {
  console.log("Paginator rendered!");

  const NUM_PER_PAGE = 3; //Warning, cannot be 0 or lower!
  const cannotPaginate = allText.length === 0;
  const totalPages = cannotPaginate
    ? 0
    : Math.ceil(allText.length / NUM_PER_PAGE);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeText, setActiveText] = useState<string[]>([]);
  const router = useRouter();
  const focusTarget = useRef<HTMLDivElement>(null);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    router.push(`?page=${page}`, undefined);
    handleSetActiveText(page, allText);
  };

  const handleSetActiveText = (page: number, allText: string[]) => {
    const startIndex = (page - 1) * NUM_PER_PAGE;
    const endIndex = startIndex + NUM_PER_PAGE;
    setActiveText(allText.slice(startIndex, endIndex));
  };

  //set update active text when allText is changed
  useEffect(() => {
    setCurrentPage(1);
    router.push(`?page=${1}`, undefined);
    handleSetActiveText(currentPage, allText);

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
        className="flex h-full flex-col items-center focus-within:outline-none"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            // handle previous page	so long as we're not on the first page
            currentPage > 1 && handlePageChange(currentPage - 1);
          }
          if (e.key === "ArrowRight") {
            // handle next page so long as we're not on the last page
            currentPage < totalPages && handlePageChange(currentPage + 1);
          }
        }}
        ref={focusTarget}
        tabIndex={0}
      >
        {/* header */}
        <SectionHeader title="Paginator" />
        <div className="flex flex-row">
          {/* ereader with next/prev buttons */}
          {currentPage - 1 > 0 && (
            <CommonButton
              label={"<"}
              onClick={() => handlePageChange(currentPage - 1)}
            />
          )}
          <div className="mx-2 flex flex-col rounded-xl border border-blue-400/30 bg-gray-800 px-4 py-2 shadow-md">
            <h2 className="px-2 text-lg font-semibold text-blue-300">
              {" "}
              {`Page ${currentPage} of ${totalPages}`}
            </h2>
            {activeText.length > 0 &&
              Array.from({ length: activeText.length }, (_, i) => i + 1).map(
                (key) => (
                  <p key={key} className="px-2 py-1 text-lg">
                    {activeText[key - 1]}
                  </p>
                ),
              )}
            {activeText.length > 0 && <Modal activeText={activeText}></Modal>}
          </div>
          {currentPage + 1 <= totalPages && (
            <CommonButton
              label={">"}
              onClick={() => handlePageChange(currentPage + 1)}
            />
          )}
        </div>
        {/* pagination buttons sections */}
        <div className="flex justify-between gap-3 px-4 py-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <CommonButton
              key={page}
              label={page}
              onClick={() => handlePageChange(page)}
            />
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
};

export default Paginator;
