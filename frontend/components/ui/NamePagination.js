"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import React from "react";

const NamePagination = ({ totalPages, currentPage, onPageChange }) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const pageLetters = alphabet.slice(0, totalPages); // Limit to totalPages

  const currentIndex = pageLetters.indexOf(currentPage); // Find current letter index
  const firstLetter = pageLetters[0];
  const lastLetter = pageLetters[pageLetters.length - 1];

  return (
    <div className="flex items-center space-x-1 justify-center sm:justify-start bg-[#d9d9d9] rounded-xl border border-black w-[100%] overflow-hidden overflow-x-auto">
      {/* First Page Button */}
      <button
        className={`px-1 py-1 rounded ${
          currentPage === firstLetter ? "text-gray-400 cursor-not-allowed" : "text-red-500"
        }`}
        onClick={() => onPageChange(firstLetter)}
        disabled={currentPage === firstLetter}
      >
        <Image
          src="/website/assets/images/icons/slider.png"
          width={1000}
          height={1000}
          alt="arrow"
          className="w-7 h-auto rotate-180"
        />
      </button>

      {/* Previous Button */}
      <button onClick={() => onPageChange(pageLetters[currentIndex - 1])} disabled={currentIndex <= 0}>
        <Icon
          icon="basil:caret-left-solid"
          width="50"
          height="50"
          className="px-2 font-bold py-1 rounded text-red-500"
        />
      </button>

      {/* Alphabetic Pagination Buttons */}
      {pageLetters.map((letter) => (
        <button
          key={letter}
          className={`px-3 py-1 text-lg font-bold rounded-full ${
            letter === currentPage ? "bg-red-500 text-white" : "text-black"
          }`}
          onClick={() => onPageChange(letter)}
        >
          {letter}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(pageLetters[currentIndex + 1])}
        disabled={currentIndex >= pageLetters.length - 1}
      >
        <Icon
          icon="basil:caret-right-solid"
          width="50"
          height="50"
          className="px-2 font-bold py-1 rounded text-red-500"
        />
      </button>

      {/* Last Page Button */}
      <button
        className={`px-1 py-1 rounded ${
          currentPage === lastLetter ? "text-gray-400 cursor-not-allowed" : "text-red-500"
        }`}
        onClick={() => onPageChange(lastLetter)}
        disabled={currentPage === lastLetter}
      >
        <Image
          src="/website/assets/images/icons/slider.png"
          width={1000}
          height={1000}
          alt="arrow"
          className="w-7 h-auto"
        />
      </button>
    </div>
  );
};

export default NamePagination;
