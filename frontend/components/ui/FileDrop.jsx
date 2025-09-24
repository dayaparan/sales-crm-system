"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";

const FileDrop = ({
  name,
  label = "Upload File",
  accept = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
  },
  maxSize = 10 * 1024 * 1024, // 10 MB
  onFileSelect,
  error,
}) => {
  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        toast.warn("Invalid file type or size exceeded.")
        return;
      }
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles;
        if (onFileSelect) onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true,
  });

  return (
    <div className="flex flex-col w-full">
      {label && <label className="text-sm mb-2 text-white">{label}</label>}
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer bg-[#0B1530] text-gray-400 transition-colors ${
          isDragActive
            ? "border-yellow-400 text-yellow-400"
            : "border-gray-600 hover:border-yellow-400 hover:text-yellow-400"
        }`}
      >
        <input {...getInputProps()} name={name} />
        <Icon className="text-7xl" icon="material-symbols:upload-file-outline" />
        {acceptedFiles.length > 0 ? (
          <span className="text-sm mt-2 text-white">{acceptedFiles[0].name}</span>
        ) : (
          <>
            <span className="text-sm">Upload a file or drag and drop</span>
            <span className="text-xs text-gray-500 mt-1">PDF, DOCX, JPG up to {maxSize / (1024 * 1024)}MB</span>
          </>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FileDrop;
