"use client";
import { useState } from "react";

const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState(null);

  const openDialog = (confirmCallback) => {
    setIsOpen(true);
    setOnConfirm(() => confirmCallback);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setOnConfirm(null);
  };

  return {
    isOpen,
    openDialog,
    closeDialog,
    onConfirm,
  };
};

export default useConfirmationDialog;
