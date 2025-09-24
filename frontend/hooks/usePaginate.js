"use client";
import { useState } from "react";

const usePaginate = () => {
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalItems: 0,
    currentPage: 1,
    pageSize: 10,
  });

  const handlePageSizeChange = (value) => setPagination((prev) => ({ ...prev, pageSize: value }));
  const handlePageChange = (value) => setPagination((prev) => ({ ...prev, currentPage: value }));

  return { pagination, setPagination, handlePageChange, handlePageSizeChange };
};

export default usePaginate;
