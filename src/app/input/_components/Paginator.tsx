import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import Modal from "./Modal";
import SectionHeader from "./SectionHeader";

interface Props {
  allText?: string[];
}

const Paginator = ({ allText = [] }: Props) => {
  const NUM_PER_PAGE = 3; //Warning, cannot be 0 or lower!
  const cannotPaginate = allText.length === 0;
  const totalPages = cannotPaginate
    ? 0
    : Math.ceil(allText.length / NUM_PER_PAGE);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeText, setActiveText] = useState<string[]>([]);
  const router = useRouter();

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
  }, [allText]);

  //set first page by default
  // if (!cannotPaginate && activeText.length === 0) {
  //   handleSetActiveText(currentPage, allText);
  // }

  return !cannotPaginate ? (
    <div className="pagination">
      <div className="flex flex-col items-center">
        <SectionHeader title="Paginator" />
        <button className="mr-auto">Previous</button>

        <button className="ml-auto">Next</button>
        <div className="mx-2 my-4 flex flex-col rounded-xl border border-blue-400/30 bg-blue-400/10 px-2 py-4 shadow-md">
          <h2 className="px-2 text-lg font-semibold text-blue-300">
            {" "}
            {`Page ${currentPage} of ${totalPages}`}
          </h2>
          {activeText.length > 0 &&
            Array.from({ length: activeText.length }, (_, i) => i + 1).map(
              (key) => (
                <p key={key} className="px-2 py-1 text-lg text-gray-300">
                  {activeText[key - 1]}
                </p>
              ),
            )}
          {activeText.length > 0 && <Modal activeText={activeText}></Modal>}
        </div>
        <div className="flex justify-between gap-3 px-4 py-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              className="rounded-xl border-2 border-blue-100/20 bg-blue-500/20 px-4 py-2 shadow-md hover:bg-blue-500"
              key={page}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
};

export default Paginator;
