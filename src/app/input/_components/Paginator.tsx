"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

interface _Props {
  totalPages?: number;
}

const Paginator = ({ totalPages = 10 }: _Props) => {
  const [currentPage, setCurrentPage] = useState<number>(10);
  const router = useRouter();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    router.push(`?page=${page}`, undefined);
  };

  return (
    <div className="pagination">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold">Paginator</h1>
        <hr className="my-4" />
        <div className="pagination-buttonss">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => handlePageChange(page)}>
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Paginator;
