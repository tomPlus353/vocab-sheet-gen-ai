"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

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

  return allText.length > 0 ? (
    <div className="pagination">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold">Paginator</h1>
        <hr className="my-2 w-[100%] border-2 border-blue-100/20" />
        <div className="flex flex-col items-center">
          {activeText &&
            Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <p
                className="px-4 py-2"
                key={page}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </p>
            ))}
        </div>
        <div className="flex justify-between gap-3">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              className="px-4 py-2"
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
